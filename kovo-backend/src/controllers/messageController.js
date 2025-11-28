import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';
import notificationService from '../services/notificationService.js';
import { emitToUser } from '../config/socket.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;

    if (recipientId === req.user.id) {
      throw new AppError('Vous ne pouvez pas vous envoyer un message à vous-même', 400);
    }

    const { data: recipient } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', recipientId)
      .single();

    if (!recipient) {
      throw new AppError('Destinataire non trouvé', 404);
    }

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          sender_id: req.user.id,
          recipient_id: recipientId,
          content,
          read: false
        }
      ])
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar),
        recipient:users!messages_recipient_id_fkey(id, first_name, last_name, avatar)
      `)
      .single();

    if (error) {
      console.error('Supabase message insert error:', error);
      throw new AppError('Erreur lors de l\'envoi du message', 500);
    }

    emitToUser(recipientId, 'new_message', message);

    await notificationService.notifyNewMessage(recipient, req.user, content);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar),
        recipient:users!messages_recipient_id_fkey(id, first_name, last_name, avatar)
      `)
      .or(`sender_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Erreur lors de la récupération des conversations', 500);
    }

    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender_id === req.user.id ? msg.recipient_id : msg.sender_id;
      const otherUser = msg.sender_id === req.user.id ? msg.recipient : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (msg.recipient_id === req.user.id && !msg.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversationWith = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data: otherUser } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, avatar')
      .eq('id', userId)
      .single();

    if (!otherUser) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar),
        recipient:users!messages_recipient_id_fkey(id, first_name, last_name, avatar)
      `)
      .or(`and(sender_id.eq.${req.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${req.user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Erreur lors de la récupération des messages', 500);
    }

    const { data: updatedMessages } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('recipient_id', req.user.id)
      .eq('read', false)
      .select('id');

    if (updatedMessages && updatedMessages.length > 0) {
      emitToUser(userId, 'messages_read', {
        readBy: req.user.id,
        messageIds: updatedMessages.map(m => m.id)
      });
    }

    res.json({
      user: otherUser,
      messages
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('recipient_id')
      .eq('id', messageId)
      .single();

    if (!message) {
      throw new AppError('Message non trouvé', 404);
    }

    if (message.recipient_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      throw new AppError('Erreur lors de la mise à jour du message', 500);
    }

    const { data: msg } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (msg) {
      emitToUser(msg.sender_id, 'message_read', {
        messageId,
        readBy: req.user.id
      });
    }

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (!message) {
      throw new AppError('Message non trouvé', 404);
    }

    if (message.sender_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const { data: msgToDelete } = await supabaseAdmin
      .from('messages')
      .select('recipient_id')
      .eq('id', messageId)
      .single();

    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw new AppError('Erreur lors de la suppression du message', 500);
    }

    if (msgToDelete) {
      emitToUser(msgToDelete.recipient_id, 'message_deleted', {
        messageId,
        deletedBy: req.user.id
      });
    }

    res.json({ message: 'Message supprimé' });
  } catch (error) {
    next(error);
  }
};
