const logger = require('./utils/logger')('ClientClass');

logger.info("TEST");
logger.err(new Error('CUSTOM'))