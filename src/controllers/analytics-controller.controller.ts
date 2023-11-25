
import UserModel from '../models/userModel';
import { connect } from '../utils/db.util';

export const getAnalytics = async (req, res) => {
    const days = req.body.days;
  try {
    await connect(); // Assuming you have a connect function to connect to MongoDB

    const usersData = await UserModel.find();

    if (!usersData || usersData.length === 0) {
      res.status(404).json({ message: 'No record found' });
      return;
    }

    const userData = usersData.map((user) => ({
      email: user.email,
      loginHistory: user.loginHistory,
    }));

    // Calculate the start and end dates for the last week
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - days);

    // Initialize day-wise data for the last 7 days
    const dayWiseData = {};
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(lastWeekStart);
      currentDate.setDate(lastWeekStart.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];
      dayWiseData[formattedDate] = { usersLogged: 0, usersNotLogged: 0 };
    }

    const usersWhoLogged = new Set();

    userData.forEach((user) => {
      user.loginHistory.forEach((login) => {
        const loginDate = new Date(login);
        if (loginDate >= lastWeekStart && loginDate < today) {
          const formattedDate = loginDate.toISOString().split('T')[0];
          if (dayWiseData[formattedDate]) {
            dayWiseData[formattedDate].usersLogged++;
            usersWhoLogged.add(user.email);
          }
        }
      });
    });

    // Calculate users who did not log in on each date
    Object.keys(dayWiseData).forEach((date) => {
      const usersWhoDidNotLog = new Set(userData.map((user) => user.email));
      usersWhoLogged.forEach((userEmail) => {
        usersWhoDidNotLog.delete(userEmail);
      });
      dayWiseData[date].usersNotLogged = usersWhoDidNotLog.size;
    });

    res.status(200).json({ dayWiseData });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
