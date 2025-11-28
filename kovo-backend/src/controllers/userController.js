import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';
import { scheduleStudentVerification, scheduleLicenseVerification } from '../services/verificationService.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, university, studentId, phone, bio, avatar } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (university) updateData.university = university;
    if (studentId !== undefined) updateData.student_id = studentId;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour du profil', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    res.json({ user: sanitizedUser });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      throw new AppError('Mot de passe actuel incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (error) {
      throw new AppError('Erreur lors du changement de mot de passe', 500);
    }

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, university, bio, avatar, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const { data: trips } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('driver_id', id)
      .eq('status', 'completed');

    const tripsCount = trips?.length || 0;

    res.json({
      user: {
        ...user,
        tripsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Mot de passe incorrect', 400);
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', req.user.id);

    if (error) {
      throw new AppError('Erreur lors de la suppression du compte', 500);
    }

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kovo/avatars',
          public_id: `user_${req.user.id}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ avatar: result.secure_url })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour de l\'avatar', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    res.json({
      user: sanitizedUser,
      message: 'Avatar mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  try {
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('avatar')
      .eq('id', req.user.id)
      .single();

    if (currentUser?.avatar && currentUser.avatar.includes('cloudinary.com')) {
      try {
        const publicId = `kovo/avatars/user_${req.user.id}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ avatar: null })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de la suppression de l\'avatar', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    res.json({
      user: sanitizedUser,
      message: 'Avatar supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriversLicense = async (req, res, next) => {
  try {
    const { licenseNumber } = req.body;

    if (!licenseNumber) {
      throw new AppError('Numéro de permis requis', 400);
    }

    const updateData = {
      drivers_license_number: licenseNumber,
      drivers_license_verified: false
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'kovo/licenses',
            public_id: `license_${req.user.id}`,
            overwrite: true,
            transformation: [
              { width: 800, quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      updateData.drivers_license_photo = result.secure_url;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour du permis', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    scheduleLicenseVerification(req.user.id);

    res.json({
      user: sanitizedUser,
      message: 'Permis de conduire mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { brand, model, color, plate } = req.body;

    if (!brand || !model || !plate) {
      throw new AppError('Marque, modèle et plaque d\'immatriculation requis', 400);
    }

    const updateData = {
      vehicle_brand: brand,
      vehicle_model: model,
      vehicle_plate: plate
    };

    if (color) {
      updateData.vehicle_color = color;
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'kovo/vehicles',
            public_id: `vehicle_${req.user.id}`,
            overwrite: true,
            transformation: [
              { width: 800, quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      updateData.vehicle_photo = result.secure_url;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour du véhicule', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    res.json({
      user: sanitizedUser,
      message: 'Informations du véhicule mises à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const uploadStudentCard = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kovo/student-cards',
          public_id: `student_${req.user.id}`,
          overwrite: true,
          transformation: [
            { width: 800, quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        student_card_photo: result.secure_url,
        student_verification_status: 'pending'
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Erreur lors de l\'upload du document étudiant', 500);
    }

    const { password, verification_code, ...sanitizedUser } = data;

    scheduleStudentVerification(req.user.id);

    res.json({
      user: sanitizedUser,
      message: 'Document étudiant envoyé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
