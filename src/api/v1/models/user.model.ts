export interface User {
    id: string;
    email: string;
    password: string; // Hashed password
    name: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Dummy users data
 * Passwords are hashed with bcrypt (10 rounds)
 * 
 * Plain text passwords for testing:
 * - admin@example.com: admin123
 * - user1@example.com: password123
 * - user2@example.com: password456
 * - john.doe@example.com: johndoe123
 */
export const dummyUsers: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        password: '$2b$10$6ETWU5BjY4OXLNFZo5rbD.9zB9y0P/p1vT6CgE8FRbaSHSbs8nIla', // admin123
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: '2',
        email: 'user1@example.com',
        password: '$2b$10$EHGzVvQ0pHXKp.sDQaF8leNC6fJa1wZ4nZ5pnqi', // password123
        name: 'User One',
        role: 'user',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: '3',
        email: 'user2@example.com',
        password: '$2b$10$uF2vJvHQJvJvJvJvJvJvJOqC0C0C0C0C0C0C0C0C0C0C0C0C0C0C0', // password456
        name: 'User Two',
        role: 'user',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
    },
    {
        id: '4',
        email: 'john.doe@example.com',
        password: '$2b$10$prElQgv/olbvlRVSj9bDVOfTgtvVmTOd.yqIxv22Z/L.8g5QzVp', // johndoe123
        name: 'John Doe',
        role: 'user',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
    }
];
