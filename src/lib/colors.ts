import chalk from 'chalk';
import type { Status } from './types.js';

export const statusColor = (status: Status) => {
  switch (status) {
    case 'completed': return chalk.green;
    case 'in_progress': return chalk.cyan;
    case 'not_started': return chalk.gray;
  }
};

export const statusDot = (status: Status) => {
  switch (status) {
    case 'completed': return chalk.green('✓');
    case 'in_progress': return chalk.cyan('●');
    case 'not_started': return chalk.gray('○');
  }
};

export const colors = {
  header: chalk.bold.white,
  dim: chalk.dim,
  error: chalk.red,
  warning: chalk.yellow,
  blocker: chalk.red,
  progress: chalk.green,
};
