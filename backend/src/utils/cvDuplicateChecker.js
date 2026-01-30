import { CVStorage } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Kiểm tra CV trùng dựa trên name, email, phone
 * Trùng nếu có ít nhất 2 trong 3 trường giống nhau
 * @param {string} name - Tên ứng viên
 * @param {string} email - Email ứng viên
 * @param {string} phone - Số điện thoại ứng viên
 * @returns {Object|null} - CV trùng hoặc null nếu không trùng
 */
export async function checkDuplicateCV(name, email, phone) {
  // Cần ít nhất 2 trường để check duplicate
  const fields = [name, email, phone].filter(f => f && f.trim());
  if (fields.length < 2) {
    return null; // Không đủ thông tin để check
  }

  // Xây dựng điều kiện tìm kiếm: ít nhất 2 trong 3 trường trùng
  const orConditions = [];

  // Trùng name và email
  if (name && email) {
    orConditions.push({
      name: { [Op.like]: name.trim() },
      email: { [Op.like]: email.trim() }
    });
  }

  // Trùng name và phone
  if (name && phone) {
    orConditions.push({
      name: { [Op.like]: name.trim() },
      phone: { [Op.like]: phone.trim() }
    });
  }

  // Trùng email và phone
  if (email && phone) {
    orConditions.push({
      email: { [Op.like]: email.trim() },
      phone: { [Op.like]: phone.trim() }
    });
  }

  if (orConditions.length === 0) {
    return null;
  }

  // Tìm CV có ít nhất 2 trường trùng, sắp xếp theo thời gian tạo (cũ nhất trước)
  const duplicateCVs = await CVStorage.findAll({
    where: {
      [Op.or]: orConditions
    },
    order: [['created_at', 'ASC']] // Lấy CV cũ nhất
  });

  if (duplicateCVs.length === 0) {
    return null;
  }

  // Lấy CV cũ nhất (đầu tiên)
  return duplicateCVs[0];
}

/**
 * Xử lý logic khi phát hiện CV trùng
 * @param {Object} duplicateCV - CV bị trùng (CV cũ)
 * @param {Object} newCV - CV mới được tạo
 * @returns {Object} - Kết quả xử lý { isDuplicate, duplicateWithCvId, oldCvUpdated }
 */
export async function handleDuplicateCV(duplicateCV, newCV) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Kiểm tra CV cũ có status = 1 và đã tạo > 6 tháng không
  const isOldCvEligible = 
    duplicateCV.status === 1 && 
    new Date(duplicateCV.createdAt) < sixMonthsAgo;

  if (isOldCvEligible) {
    // CV cũ đã > 6 tháng và status = 1, chuyển collaborator_id và admin_id về null
    duplicateCV.collaboratorId = null;
    duplicateCV.adminId = null;
    await duplicateCV.save();

    // CV mới không bị đánh dấu duplicate, có thể dùng để ứng tuyển
    newCV.isDuplicate = false;
    newCV.duplicateWithCvId = null;
    await newCV.save();

    return {
      isDuplicate: false,
      duplicateWithCvId: null,
      oldCvUpdated: true,
      message: 'CV cũ đã được chuyển về trạng thái không sở hữu, CV mới có thể sử dụng'
    };
  } else {
    // CV cũ chưa đủ điều kiện, CV mới bị đánh dấu duplicate
    newCV.isDuplicate = true;
    newCV.duplicateWithCvId = duplicateCV.id;
    await newCV.save();

    return {
      isDuplicate: true,
      duplicateWithCvId: duplicateCV.id,
      oldCvUpdated: false,
      message: 'CV bị trùng với CV đã tồn tại, không thể dùng để tạo đơn ứng tuyển'
    };
  }
}

