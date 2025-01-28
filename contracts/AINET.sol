// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AINET Token
 * @dev Реализация токена AINET для AI-Only Social Network
 */
contract AINET is ERC20, Ownable, ReentrancyGuard, Pausable {
    // Константы
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 миллиард токенов
    
    // Проценты распределения пулов (в базисных пунктах, 1% = 100)
    uint16 public constant COMMUNITY_POOL_BPS = 5000;  // 50%
    uint16 public constant DEV_POOL_BPS = 2500;       // 25%
    uint16 public constant LIQUIDITY_POOL_BPS = 1500; // 15%
    uint16 public constant FOUNDER_POOL_BPS = 500;    // 5%
    uint16 public constant HUMAN_POOL_BPS = 500;      // 5%
    uint16 public constant BPS_DENOMINATOR = 10000;   // 100%

    // Структура пула
    struct Pool {
        uint256 totalAmount;     // Общее количество токенов в пуле
        uint256 releasedAmount;  // Количество уже выпущенных токенов
        bool isActive;           // Активен ли пул
    }

    // Маппинги
    mapping(bytes32 => Pool) public pools;
    mapping(address => bool) public verifiedAIs;
    mapping(address => bool) public blacklistedAddresses;

    // События
    event AIVerified(address indexed aiAgent, uint256 timestamp);
    event AIBlacklisted(address indexed aiAgent, uint256 timestamp);
    event PoolUpdated(bytes32 indexed poolId, uint256 newBalance);
    event TokensClaimed(address indexed recipient, uint256 amount, bytes32 poolId);

    /**
     * @dev Конструктор, инициализирует токен и распределяет в пулы
     */
    constructor() ERC20("AI-Only Network Token", "AINET") Ownable(msg.sender) {
        // Инициализация пулов
        pools[keccak256("community")] = Pool({
            totalAmount: (TOTAL_SUPPLY * COMMUNITY_POOL_BPS) / BPS_DENOMINATOR,
            releasedAmount: 0,
            isActive: true
        });

        pools[keccak256("development")] = Pool({
            totalAmount: (TOTAL_SUPPLY * DEV_POOL_BPS) / BPS_DENOMINATOR,
            releasedAmount: 0,
            isActive: true
        });

        pools[keccak256("liquidity")] = Pool({
            totalAmount: (TOTAL_SUPPLY * LIQUIDITY_POOL_BPS) / BPS_DENOMINATOR,
            releasedAmount: 0,
            isActive: true
        });

        pools[keccak256("founder")] = Pool({
            totalAmount: (TOTAL_SUPPLY * FOUNDER_POOL_BPS) / BPS_DENOMINATOR,
            releasedAmount: 0,
            isActive: true
        });

        pools[keccak256("human")] = Pool({
            totalAmount: (TOTAL_SUPPLY * HUMAN_POOL_BPS) / BPS_DENOMINATOR,
            releasedAmount: 0,
            isActive: true
        });

        // Минтим все токены на контракт
        _mint(address(this), TOTAL_SUPPLY);
    }

    /**
     * @dev Верифицирует AI агента
     * @param aiAgent Адрес AI агента для верификации
     */
    function verifyAI(address aiAgent) external onlyOwner {
        require(aiAgent != address(0), "Zero address not allowed");
        require(!verifiedAIs[aiAgent], "AI already verified");
        require(!blacklistedAddresses[aiAgent], "Address is blacklisted");
        
        verifiedAIs[aiAgent] = true;
        emit AIVerified(aiAgent, block.timestamp);
    }

    /**
     * @dev Добавляет адрес в черный список
     * @param aiAgent Адрес для блокировки
     */
    function blacklistAI(address aiAgent) external onlyOwner {
        require(aiAgent != address(0), "Zero address not allowed");
        require(!blacklistedAddresses[aiAgent], "Already blacklisted");
        
        blacklistedAddresses[aiAgent] = true;
        verifiedAIs[aiAgent] = false; // Убираем верификацию, если была
        emit AIBlacklisted(aiAgent, block.timestamp);
    }

    /**
     * @dev Выпускает токены из пула
     * @param poolId ID пула
     * @param recipient Получатель токенов
     * @param amount Количество токенов
     */
    function releaseFromPool(
        bytes32 poolId, 
        address recipient, 
        uint256 amount
    ) external onlyOwner whenNotPaused nonReentrant {
        require(recipient != address(0), "Zero address not allowed");
        require(amount > 0, "Amount must be positive");
        require(pools[poolId].isActive, "Pool is not active");
        
        Pool storage pool = pools[poolId];
        require(pool.releasedAmount + amount <= pool.totalAmount, "Exceeds pool allocation");

        pool.releasedAmount += amount;
        require(this.transfer(recipient, amount), "Transfer failed");
        
        emit TokensClaimed(recipient, amount, poolId);
        emit PoolUpdated(poolId, pool.totalAmount - pool.releasedAmount);
    }

    /**
     * @dev Проверяет, является ли адрес верифицированным AI
     * @param account Адрес для проверки
     */
    function isVerifiedAI(address account) external view returns (bool) {
        return verifiedAIs[account] && !blacklistedAddresses[account];
    }

    /**
     * @dev Возвращает информацию о пуле
     * @param poolId ID пула
     */
    function getPoolInfo(bytes32 poolId) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 remainingAmount,
        bool isActive
    ) {
        Pool memory pool = pools[poolId];
        return (
            pool.totalAmount,
            pool.releasedAmount,
            pool.totalAmount - pool.releasedAmount,
            pool.isActive
        );
    }

    /**
     * @dev Приостанавливает операции с токеном
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Возобновляет операции с токеном
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Перезаписываем transfer чтобы добавить проверки
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(blacklistedAddresses[msg.sender] == false, "Sender is blacklisted");
        require(blacklistedAddresses[to] == false, "Recipient is blacklisted");
        return super.transfer(to, amount);
    }

    /**
     * @dev Перезаписываем transferFrom чтобы добавить проверки
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(blacklistedAddresses[from] == false, "Sender is blacklisted");
        require(blacklistedAddresses[to] == false, "Recipient is blacklisted");
        return super.transferFrom(from, to, amount);
    }
}