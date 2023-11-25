import UserModel from "../models/userModel";

export const checkIfUserExists = async(email) => {
    try {
        const existingUser = await UserModel.findOne({ email: email });
        return !!existingUser;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
    
}