const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');

const loadUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
        return [];
    }
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

const formatUser = (user) => ({
    id: user.id,
    name: `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}`.trim(),
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    image: user.image,
    place: user.place,
    country: user.country,
    phone: user.phone,
});

const findByEmail = (email) => loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

const findById = (id) => loadUsers().find((u) => u.id === id);

const createUser = async ({ firstName, lastName, email, password, image, middleName }) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: `local-${randomUUID()}`,
        firstName,
        middleName: middleName || '',
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        image: image || '',
        place: '',
        country: '',
        phone: '',
        role: 'user',
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    return user;
};

const verifyPassword = async (user, password) => bcrypt.compare(password, user.password);

const updateUser = (id, updates) => {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    verifyPassword,
    updateUser,
    formatUser,
};
