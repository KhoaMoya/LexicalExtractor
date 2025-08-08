'use client';

import { HistoryManager } from './history-manager';
import type { DataPage } from './types';

export class PageManager {
  private historyManager: HistoryManager;
  private currentPage: DataPage | null = null;

  constructor(historyManager: HistoryManager) {
    this.historyManager = historyManager;
    this.reset();
  }

  getCurrentPage(): DataPage | null {
    return this.currentPage;
  }

  getNextPage(): DataPage | null {
    if (this.hasNextPage()) {
      const records = this.historyManager.getAll();
      const nextIndex = (records.indexOf(this.currentPage?.record!) + 1);
      this.currentPage = ({
        record: records[nextIndex],
        hasNextPage: this.hasNextPage(),
        hasPreviousPage: this.hasPreviousPage()
      });
      return this.currentPage;
    }
    return null;
  }

  getPreviousPage(): DataPage | null {
    if (this.hasPreviousPage()) {
      const records = this.historyManager.getAll();
      const prevIndex = (records.indexOf(this.currentPage?.record!) - 1);
      this.currentPage = ({
        record: records[prevIndex],
        hasNextPage: this.hasNextPage(),
        hasPreviousPage: this.hasPreviousPage()
      });
      return this.currentPage;
    }
    return null;
  }

  hasNextPage(): boolean {
    const records = this.historyManager.getAll();
    return this.currentPage ? (records.indexOf(this.currentPage.record) < records.length - 1) : false;
  }

  hasPreviousPage(): boolean {
    const records = this.historyManager.getAll();
    return this.currentPage ? (records.indexOf(this.currentPage.record) > 0) : false;
  }

  reset(): void {
    const records = this.historyManager.getAll();
    if (records.length > 0) {
      this.currentPage = ({
        record: records[records.length - 1],
        hasNextPage: false,
        hasPreviousPage: this.hasPreviousPage()
      })
    } else {
      this.currentPage = null
    }
  }
}