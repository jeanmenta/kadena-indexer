import axios from "axios";
import pool from "./db";
import { KADENA_NODE_URL, POLLING_INTERVAL } from "./config";
import winston from "winston";

// Set up logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Interface for the /cut response
interface CutResponse {
  hashes: {
    [chainId: string]: {
      height: number;
      hash: string;
    };
  };
}

// Function to fetch the latest block hash for a specific chain
async function fetchLatestBlock(
  chainId: string = "0"
): Promise<{ hash: string; height: number } | null> {
  try {
    const response = await axios.get<CutResponse>(
      `${KADENA_NODE_URL}/chainweb/0.0/mainnet01/cut`
    );
    const chainData = response.data.hashes[chainId];
    if (!chainData) {
      logger.error(`Chain ${chainId} data not found in response`);
      return null;
    }
    logger.debug(
      `Latest block for chain ${chainId}: Height ${chainData.height}, Hash ${chainData.hash}`
    );
    return { hash: chainData.hash, height: chainData.height };
  } catch (error: any) {
    logger.error(`Error fetching latest block: ${error.message}`);
    return null;
  }
}

// Function to save the block hash with the current timestamp
async function saveBlockHash(blockHash: string): Promise<void> {
  try {
    await pool.query(
      "INSERT INTO block_hashes (block_hash, fetched_at) VALUES ($1, NOW()) ON CONFLICT DO NOTHING",
      [blockHash]
    );
    logger.info(`Saved block hash: ${blockHash}`);
  } catch (error: any) {
    logger.error(`Error saving block hash: ${error.message}`);
  }
}

// Main indexer function
async function indexer(): Promise<void> {
  let lastProcessedBlockHash: string | null = null;

  while (true) {
    const latestBlock = await fetchLatestBlock();

    if (latestBlock) {
      if (lastProcessedBlockHash !== latestBlock.hash) {
        // New block detected
        await saveBlockHash(latestBlock.hash);
        lastProcessedBlockHash = latestBlock.hash;
      } else {
        logger.info("No new block detected");
      }
    }

    // Wait for the next polling interval
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
}

// Start the indexer
indexer().catch((error) => {
  logger.error(`Indexer encountered an error: ${error.message}`);
  process.exit(1);
});
