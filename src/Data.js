const mongo = require('mongodb');
const { Logger } = require('./Logger');

class Data {
    static logger = new Logger('Data', Logger.BLUE);

    static async connect(config) {
        this.client = new mongo.MongoClient(config.uri);

        try {
            await this.client.connect();

            await this.client.db('admin').command({
                ping: 1
            });

            this.db = this.client.db('mpp', {
                authSource: 'admin'
            });
            
            this.logger.log('Connected to database');
        } catch (err) {
            this.logger.error('Unable to connect to database:', err);
            process.exit(2);
        } finally {
            this.users = this.db.collection('users');
        }
    }

    static async insertUser(user) {
        try {
            const result = await this.users.insertOne(user);
            return result;
        } catch (err) {
            return err;
        }
    }

    static async updateUser(_id, user) {
        try {
            const result = await this.users.updateOne({ _id }, {
                $set: user
            });
            return result;
        } catch (err) {
            return err;
        }
    }

    static async replaceUser(_id, user) {
        try {
            const result = await this.users.replaceOne({ _id }, user);
            return result;
        } catch (err) {
            return err;
        }
    }

    static async deleteUser(_id) {
        try {
            const result = await this.users.deleteOne({ _id });
            return result;
        } catch (err) {
            return err;
        }
    }

    static async getUser(_id) {
        try {
            const result = await this.users.findOne({ _id });
            return result;
        } catch (err) {
            return err;
        }
    }

    static async purgeUsers() {
        this.logger.warn('Purging all users...');
        return await this.users.deleteMany();
    }

    static async isAdmin(user) {
        if (user.flags.hasOwnProperty('admin')) {
            return user.flags.admin == true;
        } else {
            return false;
        }
    }
}

module.exports = {
    Data
}
