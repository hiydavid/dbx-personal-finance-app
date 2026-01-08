"""MLflow tracing configuration for GenAI observability.

This module configures MLflow to:
1. Send traces to Databricks (not local MLflow)
2. Set the experiment from MLFLOW_EXPERIMENT_ID env var
3. Enable OpenAI autolog for automatic LLM call tracing
"""

import logging
import os

import mlflow

logger = logging.getLogger(__name__)

# Configure MLflow to use Databricks as backend
mlflow.set_registry_uri('databricks-uc')
mlflow.set_tracking_uri('databricks')

# Configure experiment from environment variable
# MLFLOW_EXPERIMENT_NAME = path like /Users/.../name (creates if doesn't exist)
# MLFLOW_EXPERIMENT_ID = numeric ID (must already exist)
experiment_name = os.environ.get('MLFLOW_EXPERIMENT_NAME')
experiment_id = os.environ.get('MLFLOW_EXPERIMENT_ID')

if experiment_name:
  # Use experiment name (path) - will create if doesn't exist
  mlflow.set_experiment(experiment_name=experiment_name)
  logger.info(f'MLflow experiment name: {experiment_name}')
elif experiment_id:
  # Use numeric experiment ID - must already exist
  mlflow.set_experiment(experiment_id=experiment_id)
  logger.info(f'MLflow experiment ID: {experiment_id}')
else:
  logger.warning(
    'Neither MLFLOW_EXPERIMENT_NAME nor MLFLOW_EXPERIMENT_ID set - '
    'traces will go to default experiment'
  )

# Note: OpenAI autolog is disabled because it creates separate root traces
# that override our manual span's inputs/outputs, causing Request/Response
# columns to show as null in the MLflow UI.
# mlflow.openai.autolog()
logger.info('MLflow tracing configured (autolog disabled for manual control)')
