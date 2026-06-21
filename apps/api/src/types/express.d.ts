import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Zod-parsed values from validate() middleware — use instead of mutating req.query/params */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
