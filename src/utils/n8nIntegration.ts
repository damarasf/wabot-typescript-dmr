import axios, { AxiosError } from 'axios';
import config from './config';
import logger from './logger';

/**
 * N8N Integration Utility
 * Provides methods to execute N8N workflows and webhooks
 * Includes comprehensive error handling and logging
 */

// Interface for N8N workflow execution
interface N8NExecutionOptions {
  workflowId: string;
  data?: Record<string, any>;
  timeout?: number;
}

// Interface for N8N webhook execution
interface N8NWebhookOptions {
  webhookPath: string;
  data?: Record<string, any>;
  timeout?: number;
}

// Interface for N8N response
interface N8NResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
}

/**
 * Execute N8N workflow
 * @param options - Workflow execution options
 * @returns Promise with workflow execution result
 */
export async function executeWorkflow({ 
  workflowId, 
  data = {}, 
  timeout = 30000 
}: N8NExecutionOptions): Promise<N8NResponse> {
  try {
    // Validate inputs
    if (!workflowId || typeof workflowId !== 'string') {
      throw new Error('Invalid workflow ID provided');
    }
    
    if (!config.n8nUrl || !config.n8nToken) {
      throw new Error('N8N configuration missing (URL or token)');
    }
      logger.info('Executing N8N workflow', { workflowId });
    
    // Prepare request
    const url = `${config.n8nUrl}/api/v1/workflows/${workflowId}/execute`;
    const requestData = {
      data,
      waitTill: 'finished', // Wait for workflow completion
    };
    
    const response = await axios.post(url, requestData, {
      headers: {
        'X-N8N-API-KEY': config.n8nToken,
        'Content-Type': 'application/json',
      },
      timeout,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
      // Handle different response statuses
    if (response.status === 200 || response.status === 201) {
      // Only log detailed info if debug level is enabled
      if (process.env.LOG_LEVEL === 'debug') {
        logger.info('N8N workflow executed successfully', { 
          workflowId, 
          executionId: response.data?.executionId,
          status: response.status 
        });
      }
      return {
        success: true,
        data: response.data,
        executionId: response.data?.executionId,
      };
    } else if (response.status === 404) {
      throw new Error(`Workflow not found: ${workflowId}`);
    } else if (response.status === 401) {
      throw new Error('Unauthorized - invalid N8N token');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded - too many requests');
    } else {
      throw new Error(`N8N API error: ${response.status} - ${response.statusText}`);
    }
    
  } catch (error) {
    logger.error('Error executing N8N workflow:', { 
      error: error instanceof Error ? error.message : error,
      workflowId 
    });
    
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to N8N server');
      } else if (axiosError.code === 'ENOTFOUND') {
        throw new Error('N8N server not found - check URL configuration');
      } else if (axiosError.code === 'ETIMEDOUT') {
        throw new Error('N8N workflow execution timeout');
      } else if (axiosError.response?.status === 404) {
        throw new Error(`Workflow not found: ${workflowId}`);
      } else if (axiosError.response?.status === 401) {
        throw new Error('Unauthorized - invalid N8N token');
      } else {
        throw new Error(`N8N API error: ${axiosError.message}`);
      }
    }
    
    // Re-throw other errors
    throw error instanceof Error ? error : new Error('Unknown N8N execution error');
  }
}

/**
 * Execute N8N webhook
 * @param options - Webhook execution options
 * @returns Promise with webhook execution result
 */
export async function executeWebhook({ 
  webhookPath, 
  data = {}, 
  timeout = 15000 
}: N8NWebhookOptions): Promise<N8NResponse> {
  try {
    // Validate inputs
    if (!webhookPath || typeof webhookPath !== 'string') {
      throw new Error('Invalid webhook path provided');
    }
    
    if (!config.n8nUrl) {
      throw new Error('N8N URL configuration missing');
    }
      logger.info('Executing N8N webhook', { webhookPath });
    
    // Clean webhook path (remove leading slash if present)
    const cleanPath = webhookPath.startsWith('/') ? webhookPath.slice(1) : webhookPath;
    const url = `${config.n8nUrl}/${cleanPath}`;
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
      // Handle different response statuses
    if (response.status === 200 || response.status === 201) {
      // Only log detailed info if debug level is enabled
      if (process.env.LOG_LEVEL === 'debug') {
        logger.info('N8N webhook executed successfully', { 
          webhookPath, 
          status: response.status 
        });
      }
      return {
        success: true,
        data: response.data,
      };
    } else if (response.status === 404) {
      throw new Error(`Webhook not found: ${webhookPath}`);
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded - too many webhook requests');
    } else {
      throw new Error(`N8N webhook error: ${response.status} - ${response.statusText}`);
    }
    
  } catch (error) {
    logger.error('Error executing N8N webhook:', { 
      error: error instanceof Error ? error.message : error,
      webhookPath 
    });
    
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to N8N server');
      } else if (axiosError.code === 'ENOTFOUND') {
        throw new Error('N8N server not found - check URL configuration');
      } else if (axiosError.code === 'ETIMEDOUT') {
        throw new Error('N8N webhook execution timeout');
      } else if (axiosError.response?.status === 404) {
        throw new Error(`Webhook not found: ${webhookPath}`);
      } else {
        throw new Error(`N8N webhook error: ${axiosError.message}`);
      }
    }
    
    // Re-throw other errors
    throw error instanceof Error ? error : new Error('Unknown N8N webhook error');
  }
}

/**
 * Default export with all N8N integration functions
 * Provides a clean interface for importing N8N utilities
 */
export default {
  executeWorkflow,
  executeWebhook,
};
