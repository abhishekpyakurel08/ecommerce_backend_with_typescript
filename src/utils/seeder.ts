import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { User } from '../model/user.models';
import { Product } from '../model/product.models';
import { Coupon } from '../model/coupon.models';
import { Order } from '../model/order.models';
import { connectDB } from '../services/db.service';
import { logger } from './logger';

export const generateUsers = async (numCount = 10) => {
    try {
        const users = [];
        for (let i = 0; i < numCount; i++) {
            users.push({
                _id: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                photo: faker.image.avatar(),
                role: faker.helpers.arrayElement(["admin", "user"]),
                gender: faker.helpers.arrayElement(["male", "female", "other"]),
                dob: faker.date.birthdate(),
                password: faker.internet.password()
            });
        }
        await User.insertMany(users);
        logger.info(`${numCount} Users have been seeded.`);
    } catch (error) {
        logger.error('Error seeding users:', { error: (error as Error).message });
        process.exit(1);
    }
};

export const generateProducts = async (numCount = 40) => {
    try {
        const products = [];
        for (let i = 0; i < numCount; i++) {
            products.push({
                name: faker.commerce.productName(),
                photo: faker.image.url(),
                price: Number(faker.commerce.price({ min: 10, max: 1000 })),
                stock: faker.number.int({ min: 0, max: 100 }),
                category: faker.commerce.department().toLowerCase(),
            });
        }
        await Product.insertMany(products);
        logger.info(`${numCount} Products have been seeded.`);
    } catch (error) {
        logger.error('Error seeding products:', { error: (error as Error).message });
        process.exit(1);
    }
};

export const generateCoupons = async (numCount = 10) => {
    try {
        const coupons = [];
        for (let i = 0; i < numCount; i++) {
            coupons.push({
                code: faker.string.alphanumeric({ length: 6, casing: "upper" }),
                amount: faker.number.int({ min: 10, max: 500 }),
            });
        }
        await Coupon.insertMany(coupons);
        logger.info(`${numCount} Coupons have been seeded.`);
    } catch (error) {
        logger.error('Error seeding coupons:', { error: (error as Error).message });
        process.exit(1);
    }
};

export const generateOrders = async (numCount = 10) => {
    try {
        const users = await User.find().select("_id");
        const products = await Product.find().select("_id name photo price");

        if (users.length === 0 || products.length === 0) {
            logger.warn("No users or products found to attach to orders. Please seed users and products first.");
            return;
        }

        const orders = [];
        for (let i = 0; i < numCount; i++) {
            const numItems = faker.number.int({ min: 1, max: 5 });
            const orderItems = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const product = faker.helpers.arrayElement(products);
                const quantity = faker.number.int({ min: 1, max: 5 });
                const itemPrice = product.price || faker.number.int({ min: 50, max: 500 });
                subtotal += itemPrice * quantity;
                orderItems.push({
                    name: product.name || faker.commerce.productName(),
                    photo: product.photo || faker.image.url(),
                    price: itemPrice,
                    quantity: quantity,
                    productId: product._id
                });
            }

            const tax = Math.round(subtotal * 0.18); // 18% tax
            const shippingCharges = faker.number.int({ min: 0, max: 100 });
            const discount = faker.number.int({ min: 0, max: Math.min(200, subtotal) });
            const total = subtotal + tax + shippingCharges - discount;

            const user = faker.helpers.arrayElement(users);

            orders.push({
                shippingInfo: {
                    address: faker.location.streetAddress(),
                    city: faker.location.city(),
                    country: faker.location.country(),
                    state: faker.location.state(),
                    pinCode: faker.number.int({ min: 10000, max: 999990 }),
                },
                user: user._id, // User schema maps id to String
                subtotal,
                tax,
                shippingCharges,
                discount,
                total,
                status: faker.helpers.arrayElement(["Processing", "Shipped", "Delivered", "cancelled"]),
                orderItems,
            });
        }
        await Order.insertMany(orders);
        logger.info(`${numCount} Orders have been seeded.`);
    } catch (error) {
        logger.error('Error seeding orders:', { error: (error as Error).message });
        process.exit(1);
    }
};

export const clearData = async () => {
    try {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Coupon.deleteMany({});
        await Order.deleteMany({});
        logger.info('Database cleared successfully.');
    } catch (error) {
        logger.error('Error clearing data:', { error: (error as Error).message });
        process.exit(1);
    }
};

// Function to run when the script is called directly
const runSeeder = async () => {
    try {
        await connectDB();

        const arg = process.argv[2];
        if (arg === '-d') {
            await clearData();
            process.exit(0);
        } else if (arg === '-s') {
            await clearData();
            await generateUsers(10);
            await generateProducts(40);
            await generateCoupons(5);
            await generateOrders(15);
            process.exit(0);
        } else {
            console.log("Please provide a flag: '-s' to seed data, '-d' to delete data.");
            process.exit(1);
        }
    } catch (error) {
        logger.error('Seeder execution error:', { error });
        process.exit(1);
    }
};

// Run the seeder if called directly
if (require.main === module) {
    runSeeder();
}
