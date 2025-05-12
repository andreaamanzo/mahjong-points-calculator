import dotenv from 'dotenv'
dotenv.config()

export const {
    SITE_HOST,
    PORT,
    DB_HOST,
    DB_USER,
    DB_USER_PASSWORD,
    DB_ROOT_PASSWORD,
    DB_NAME
} = process.env

export default {
    SITE_HOST,
    PORT,
    DB_HOST,
    DB_USER,
    DB_USER_PASSWORD,
    DB_ROOT_PASSWORD,
    DB_NAME
}