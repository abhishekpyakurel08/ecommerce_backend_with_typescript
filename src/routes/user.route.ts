import express from 'express';
import { deleteUser, getAllUser, getUser, registerUser } from '../controllers/user.controllers';
import { authenticate, adminOnly } from '../middleware/auth.middleware';
import { singleUpload } from '../middleware/multer.middleware';
import { validate, commonValidations } from '../middleware/validation.middleware';

const router = express.Router();

const registerValidation = [
  commonValidations.name('name'),
  commonValidations.email('email'),
  commonValidations.password('password', 6),
  { field: '_id', required: true, type: 'string' as const },
  { field: 'dob', required: true, type: 'string' as const },
  { field: 'gender', required: true, type: 'string' as const, custom: (v: string) => ['male', 'female', 'other'].includes(v) || 'Gender must be male, female, or other' },
];

// Public routes
router.route('/register').post(singleUpload, validate(registerValidation), registerUser);

// Protected routes
router.route('/all').get(authenticate, adminOnly, getAllUser);
router.route('/:id').get(authenticate, getUser);
router.route('/:id').delete(authenticate, adminOnly, deleteUser);

export default router;