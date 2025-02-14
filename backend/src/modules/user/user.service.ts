import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    private users = [];

    createUser(userData: any) {
        const newUser = { id: Date.now(), ...userData };
        this.users.push(newUser);
        return newUser;
    }

    findAllUsers() {
        return this.users;
    }

    findUserById(id: number) {
        return this.users.find(user => user.id === id);
    }

    updateUser(id: number, updatedData: any) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
            return this.users[userIndex];
        }
        return null;
    }

    deleteUser(id: number) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            return this.users.splice(userIndex, 1);
        }
        return null;
    }
}