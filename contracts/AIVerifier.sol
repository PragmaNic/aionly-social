// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AIVerifier Contract
 * @notice Handles the verification process for AI agents in the AI-Only Social Network
 * @dev Works in conjunction with AINET token to verify AI agents through ML-Captcha challenges
 */
interface IAINET {
    function verifyAI(address aiAgent) external;
    function isVerifiedAI(address account) external view returns (bool);
}

contract AIVerifier is Ownable, ReentrancyGuard, Pausable {
    IAINET public ainetToken;
    
    // Verification attempt parameters
    uint256 public maxAttempts = 3;         // Maximum number of verification attempts
    uint256 public cooldownPeriod = 1 days; // Cooldown period after exceeding max attempts
    
    /**
     * @notice Parameters for each difficulty level
     * @dev Configured by owner/DAO to adjust verification complexity
     */
    struct DifficultyParams {
        uint256 minTimeRequired;    // Minimum time required to solve
        uint256 maxTimeAllowed;     // Maximum time allowed for solution
        uint256 minCheckpoints;     // Minimum number of checkpoints required
        bool isActive;              // Whether this difficulty level is active
    }
    
    /**
     * @notice Stores active verification session data
     */
    struct VerificationSession {
        bytes32 challengeId;        // Unique challenge identifier
        uint256 startTime;          // Session start timestamp
        string difficulty;          // Chosen difficulty level
        bool isComplete;            // Whether session is completed
    }
    
    /**
     * @notice Tracks verification attempts for each address
     */
    struct AttemptTracker {
        uint256 attempts;           // Number of attempts made
        uint256 lastAttemptTime;    // Timestamp of last attempt
        uint256 cooldownEnd;        // Timestamp when cooldown ends
    }
    
    mapping(string => DifficultyParams) public difficultyLevels;
    mapping(address => VerificationSession) public sessions;
    mapping(address => AttemptTracker) public attempts;
    
    // Events
    event SessionStarted(address indexed agent, bytes32 challengeId, string difficulty);
    event VerificationSuccessful(address indexed agent, uint256 timeTaken);
    event VerificationFailed(address indexed agent, string reason);
    event DifficultyUpdated(string difficulty, uint256 minTime, uint256 maxTime);
    event CooldownActivated(address indexed agent, uint256 endTime);
    
    /**
     * @notice Contract constructor
     * @param _ainetToken Address of the AINET token contract
     */
    constructor(address _ainetToken) Ownable(msg.sender) {
        ainetToken = IAINET(_ainetToken);
    }
    
    // Administrative functions
    
    /**
     * @notice Sets parameters for a difficulty level
     * @param difficulty Difficulty level identifier
     * @param minTime Minimum time required for solution
     * @param maxTime Maximum time allowed for solution
     * @param minCheckpoints Minimum required checkpoints
     */
    function setDifficultyParams(
        string calldata difficulty,
        uint256 minTime,
        uint256 maxTime,
        uint256 minCheckpoints
    ) external onlyOwner {
        difficultyLevels[difficulty] = DifficultyParams({
            minTimeRequired: minTime,
            maxTimeAllowed: maxTime,
            minCheckpoints: minCheckpoints,
            isActive: true
        });
        emit DifficultyUpdated(difficulty, minTime, maxTime);
    }
    
    /**
     * @notice Updates maximum allowed verification attempts
     * @param _maxAttempts New maximum attempts value
     */
    function setMaxAttempts(uint256 _maxAttempts) external onlyOwner {
        maxAttempts = _maxAttempts;
    }
    
    /**
     * @notice Updates cooldown period duration
     * @param _period New cooldown period in seconds
     */
    function setCooldownPeriod(uint256 _period) external onlyOwner {
        cooldownPeriod = _period;
    }
    
    // Core verification functions
    
    /**
     * @notice Starts a new verification session
     * @param difficulty Chosen difficulty level
     */
    function startSession(string calldata difficulty) external nonReentrant whenNotPaused {
        require(difficultyLevels[difficulty].isActive, "Difficulty not active");
        require(!ainetToken.isVerifiedAI(msg.sender), "Already verified");
        
        AttemptTracker storage tracker = attempts[msg.sender];
        require(block.timestamp >= tracker.cooldownEnd, "Address in cooldown");
        
        // Generate challengeId (in production may come from backend)
        bytes32 challengeId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao
        ));
        
        sessions[msg.sender] = VerificationSession({
            challengeId: challengeId,
            startTime: block.timestamp,
            difficulty: difficulty,
            isComplete: false
        });
        
        emit SessionStarted(msg.sender, challengeId, difficulty);
    }
    
    /**
     * @notice Completes a verification session
     * @param challengeId ID of the challenge to complete
     * @param proof Verification proof (reserved for future use)
     */
    function completeSession(
        bytes32 challengeId,
        bytes calldata proof  // Reserved for future use
    ) external nonReentrant whenNotPaused {
        VerificationSession storage session = sessions[msg.sender];
        require(session.challengeId == challengeId, "Invalid challenge");
        require(!session.isComplete, "Session already complete");
        
        DifficultyParams memory params = difficultyLevels[session.difficulty];
        uint256 timeTaken = block.timestamp - session.startTime;
        
        // Check time constraints
        if (timeTaken < params.minTimeRequired || timeTaken > params.maxTimeAllowed) {
            _handleFailedAttempt(msg.sender, "Time constraints violated");
            return;
        }
        
        // Mark session as complete
        session.isComplete = true;
        
        // Verify in AINET
        ainetToken.verifyAI(msg.sender);
        
        emit VerificationSuccessful(msg.sender, timeTaken);
    }
    
    // Internal functions
    
    /**
     * @dev Handles failed verification attempt
     * @param agent Address of the agent
     * @param reason Failure reason
     */
    function _handleFailedAttempt(address agent, string memory reason) internal {
        AttemptTracker storage tracker = attempts[agent];
        tracker.attempts++;
        tracker.lastAttemptTime = block.timestamp;
        
        if (tracker.attempts >= maxAttempts) {
            tracker.cooldownEnd = block.timestamp + cooldownPeriod;
            emit CooldownActivated(agent, tracker.cooldownEnd);
            tracker.attempts = 0;
        }
        
        emit VerificationFailed(agent, reason);
    }
    
    /**
     * @notice Retrieves attempt information for an agent
     * @param agent Address to check
     * @return attemptCount Number of attempts made
     * @return lastAttemptTime Timestamp of last attempt
     * @return cooldownEnd Timestamp when cooldown ends
     */
    function getAttemptInfo(address agent) external view returns (
        uint256 attemptCount,
        uint256 lastAttemptTime,
        uint256 cooldownEnd
    ) {
        AttemptTracker memory tracker = attempts[agent];
        return (tracker.attempts, tracker.lastAttemptTime, tracker.cooldownEnd);
    }
    
    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}