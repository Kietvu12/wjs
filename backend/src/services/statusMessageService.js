import { Message, JobApplication, Job, CVStorage, Collaborator } from '../models/index.js';

/**
 * Status Message Service
 * Tự động tạo tin nhắn trạng thái khi admin cập nhật trạng thái
 */
export const statusMessageService = {
  /**
   * Lấy label của trạng thái
   */
  getStatusLabel: (status) => {
    const statusMap = {
      1: 'Admin đang xử lý',
      2: 'Đang tiến cử',
      3: 'Đang xếp lịch phỏng vấn',
      4: 'Đang phỏng vấn',
      5: 'Đang đợi naitei',
      6: 'Đang thương lượng naitei',
      7: 'Đang đợi nyusha',
      8: 'Đã nyusha',
      9: 'Đang chờ thanh toán với công ty',
      10: 'Gửi yêu cầu thanh toán',
      11: 'Đã thanh toán',
      12: 'Hồ sơ không hợp lệ',
      15: 'Kết quả trượt',
      16: 'Hủy giữa chừng',
      17: 'Không shodaku'
    };
    return statusMap[status] || `Trạng thái ${status}`;
  },

  /**
   * Tạo tin nhắn trạng thái tự động
   * @param {Object} params
   * @param {number} params.jobApplicationId - ID của job application
   * @param {number} params.oldStatus - Trạng thái cũ
   * @param {number} params.newStatus - Trạng thái mới
   * @param {number} params.adminId - ID của admin thực hiện
   * @param {string} params.note - Ghi chú thêm (tùy chọn)
   */
  createStatusMessage: async ({ jobApplicationId, oldStatus, newStatus, adminId, note = null }) => {
    try {
      // Lấy thông tin job application
      const jobApplication = await JobApplication.findByPk(jobApplicationId, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'title', 'jobCode']
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false,
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!jobApplication) {
        console.error(`[Status Message] Job application #${jobApplicationId} not found`);
        return null;
      }

      // Chỉ tạo message nếu có collaborator
      if (!jobApplication.collaboratorId) {
        console.log(`[Status Message] Job application #${jobApplicationId} has no collaborator, skipping message`);
        return null;
      }

      // Tạo nội dung tin nhắn
      const oldStatusLabel = this.getStatusLabel(oldStatus);
      const newStatusLabel = this.getStatusLabel(newStatus);
      
      let content = `📋 **Cập nhật trạng thái đơn ứng tuyển**\n\n`;
      content += `**Đơn ứng tuyển:** ${jobApplication.job?.title || 'N/A'} (${jobApplication.job?.jobCode || 'N/A'})\n`;
      content += `**Ứng viên:** ${jobApplication.cv?.name || 'N/A'} (${jobApplication.cv?.code || 'N/A'})\n\n`;
      content += `**Trạng thái cũ:** ${oldStatusLabel}\n`;
      content += `**Trạng thái mới:** ${newStatusLabel}\n`;

      // Thêm thông tin bổ sung dựa trên trạng thái mới
      if (newStatus === 8 && jobApplication.nyushaDate) {
        content += `\n**Ngày nyusha:** ${new Date(jobApplication.nyushaDate).toLocaleDateString('vi-VN')}\n`;
      }
      if (newStatus === 4 && jobApplication.interviewDate) {
        content += `\n**Ngày phỏng vấn:** ${new Date(jobApplication.interviewDate).toLocaleDateString('vi-VN')}\n`;
      }
      if (newStatus === 11 && jobApplication.yearlySalary) {
        content += `\n**Lương năm:** ${jobApplication.yearlySalary.toLocaleString('vi-VN')}đ\n`;
      }
      if (newStatus === 15 || newStatus === 16 || newStatus === 17) {
        if (jobApplication.rejectNote) {
          content += `\n**Lý do:** ${jobApplication.rejectNote}\n`;
        }
      }

      // Thêm ghi chú nếu có
      if (note) {
        content += `\n**Ghi chú:** ${note}\n`;
      }

      content += `\n*Tin nhắn tự động từ hệ thống*`;

      // Tạo message
      const message = await Message.create({
        jobApplicationId,
        adminId,
        collaboratorId: jobApplication.collaboratorId,
        senderType: 3, // System message
        content,
        isReadByAdmin: true, // Admin đã biết vì chính họ thực hiện
        isReadByCollaborator: false // CTV chưa đọc
      });

      console.log(`[Status Message] Created status message #${message.id} for job application #${jobApplicationId}`);

      return message;
    } catch (error) {
      console.error(`[Status Message] Error creating status message for job application #${jobApplicationId}:`, error);
      // Không throw error để không ảnh hưởng đến việc update status
      return null;
    }
  },

  /**
   * Tạo tin nhắn khi cập nhật các thông tin khác (không phải status)
   * @param {Object} params
   * @param {number} params.jobApplicationId - ID của job application
   * @param {Object} params.oldData - Dữ liệu cũ
   * @param {Object} params.newData - Dữ liệu mới
   * @param {number} params.adminId - ID của admin thực hiện
   */
  createUpdateMessage: async ({ jobApplicationId, oldData, newData, adminId }) => {
    try {
      const jobApplication = await JobApplication.findByPk(jobApplicationId, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'title', 'jobCode']
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false,
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!jobApplication || !jobApplication.collaboratorId) {
        return null;
      }

      const changes = [];
      
      // Kiểm tra các thay đổi quan trọng
      if (oldData.interviewDate !== newData.interviewDate && newData.interviewDate) {
        changes.push(`📅 **Ngày phỏng vấn:** ${new Date(newData.interviewDate).toLocaleString('vi-VN')}`);
      }
      if (oldData.interviewRound2Date !== newData.interviewRound2Date && newData.interviewRound2Date) {
        changes.push(`📅 **Ngày phỏng vấn vòng 2:** ${new Date(newData.interviewRound2Date).toLocaleString('vi-VN')}`);
      }
      if (oldData.nyushaDate !== newData.nyushaDate && newData.nyushaDate) {
        changes.push(`🎉 **Ngày nyusha:** ${new Date(newData.nyushaDate).toLocaleDateString('vi-VN')}`);
      }
      if (oldData.yearlySalary !== newData.yearlySalary && newData.yearlySalary) {
        changes.push(`💰 **Lương năm:** ${parseFloat(newData.yearlySalary).toLocaleString('vi-VN')}đ`);
      }
      if (oldData.expectedPaymentDate !== newData.expectedPaymentDate && newData.expectedPaymentDate) {
        changes.push(`💳 **Ngày thanh toán dự kiến:** ${new Date(newData.expectedPaymentDate).toLocaleDateString('vi-VN')}`);
      }
      if (oldData.rejectNote !== newData.rejectNote && newData.rejectNote) {
        changes.push(`📝 **Lý do từ chối:** ${newData.rejectNote}`);
      }

      // Chỉ tạo message nếu có thay đổi
      if (changes.length === 0) {
        return null;
      }

      let content = `📋 **Cập nhật thông tin đơn ứng tuyển**\n\n`;
      content += `**Đơn ứng tuyển:** ${jobApplication.job?.title || 'N/A'} (${jobApplication.job?.jobCode || 'N/A'})\n`;
      content += `**Ứng viên:** ${jobApplication.cv?.name || 'N/A'} (${jobApplication.cv?.code || 'N/A'})\n\n`;
      content += changes.join('\n');
      content += `\n\n*Tin nhắn tự động từ hệ thống*`;

      const message = await Message.create({
        jobApplicationId,
        adminId,
        collaboratorId: jobApplication.collaboratorId,
        senderType: 3, // System message
        content,
        isReadByAdmin: true,
        isReadByCollaborator: false
      });

      console.log(`[Status Message] Created update message #${message.id} for job application #${jobApplicationId}`);

      return message;
    } catch (error) {
      console.error(`[Status Message] Error creating update message for job application #${jobApplicationId}:`, error);
      return null;
    }
  }
};

