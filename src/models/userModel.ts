
import mongoose from 'mongoose';

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  hashedPassword: string;
  userType: string;
  lastLogin: number | null;
  loginHistory?: number[];
}

const userSchema = new mongoose.Schema<User>({
  first_name: String,
  last_name: String,
  email: String,
  hashedPassword: String,
  userType: String,
  lastLogin: { type: Number, default: null },
  loginHistory: { type: [Number], default: [] },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
