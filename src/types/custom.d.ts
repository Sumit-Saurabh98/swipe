import { Request } from 'express';

declare global {
  namespace Express {
    interface CustomRequest extends Request {
      user?: any;
      params: any;
      body: any;
    }
  }
}