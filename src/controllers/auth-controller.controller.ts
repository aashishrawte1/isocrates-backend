import * as bcrypt from 'bcrypt';
// import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { checkIfUserExists } from '../functions/user-helper';
import UserModel from '../models/userModel';
import { connect } from '../utils/db.util';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aashishrawte1@gmail.com',
    pass: 'aashish1997*#',
  },
});

export const registerController = async (req, res) => {
    const userData = req.body;

    try {
        await connect();
        checkIfUserExists(userData.email).then(async (userExist) => {
          if(userExist) {
            res.status(409).send({ message: 'User already exists'});
          } else {
            if(userData.email && userData.password) {
              const hashedPassword = await bcrypt.hash(userData.password, 10);
              const createUserPayload = new UserModel({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                hashedPassword: hashedPassword,
                userType: userData.userType,
                lastLogin: new Date().getTime()
              })
              await createUserPayload.save().then(async (savedUser) => {
                console.log('User creation complete');
                const token = jwt.sign({ userId: savedUser._id, email: savedUser.email }, 'yourSecretKey', { expiresIn: '1h' });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const updateLoginUser = await UserModel.findOneAndUpdate(
                  { email: savedUser.email },
                  { $set: { lastLogin: new Date() }, $push: { loginHistory: new Date() } },
                  { new: true }
                );
                res.status(200).json({ success: true, message: 'User registered successfully', data: savedUser, token });
              })
              .catch((error) => {
                console.error('Error:', error);
                res.status(500).json({ success: false, message: 'User creation failed' });
              });
          } else {
              res.send({ message: 'insufficient credentials'});
          }
          }
        }).catch((error) => {
          console.error('Error:', error);
        })
        
        
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

export const loginController = async(req, res) => {
  try {
    const { email, password } = req.query;
    await connect()
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      const token = jwt.sign({ userId: user._id, email: user.email }, 'yourSecretKey', { expiresIn: '1h' });
      // maintaining login history


      const updateLoginUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: { lastLogin: new Date() }, $push: { loginHistory: new Date() } },
        { new: true }
      );

      if (!updateLoginUser) {
        res.status(404).json({ message: 'User not found, Please register yourself first' });
        return;
      }

      //end of login history
      res.status(200).json({ message: 'Login successful', user, token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const forgetPassword = async(req, res) => {
  console.log(req.body.email);
  const email = req.body.email;
    
  try {
    const user = await UserModel.findOne({ email }).maxTimeMS(20000);
    console.log('user', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, 'yourSecretKey', { expiresIn: '1h' });

    const resetLink = `http://localhost:4200/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'aashishrawte1@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: ${resetLink} <br/> link is only valid for 10 minutes`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log(info);
      }
      
      return res.json({ message: 'Email sent with reset instructions' });
    });

  } catch (error) {
    console.error(error);
  }

}

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(resetToken, 'yourSecretKey');
    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
    console.error(error);
  }
}
