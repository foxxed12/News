// backend/types/express.d.ts
import { User as AppUser } from '../users/entities/user.entity';

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}
