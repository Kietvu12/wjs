import {
  JobApplication,
  PaymentRequest
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Scheduled job: Tự động chuyển job_application status = 10 và payment_request status = 1
 * sau 3 tháng kể từ khi job_application status = 8 (Đã nyusha)
 * 
 * Chạy mỗi ngày một lần
 */
export async function checkAndUpdatePaymentStatus() {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Tìm các job_application có:
    // - status = 8 (Đã nyusha)
    // - nyushaDate đã qua 3 tháng
    // - chưa được chuyển status = 10
    const jobApplications = await JobApplication.findAll({
      where: {
        status: 8, // Đã nyusha
        nyushaDate: {
          [Op.lte]: threeMonthsAgo
        }
      },
      include: [
        {
          model: PaymentRequest,
          as: 'paymentRequests',
          required: false,
          where: {
            status: 0 // Chỉ cập nhật payment_request đang chờ duyệt
          }
        }
      ]
    });

    let updatedCount = 0;

    for (const jobApp of jobApplications) {
      // Chuyển job_application status = 10 (Gửi yêu cầu thanh toán)
      jobApp.status = 10;
      await jobApp.save();

      // Chuyển payment_request status = 1 (Đã duyệt)
      if (jobApp.paymentRequests && jobApp.paymentRequests.length > 0) {
        for (const paymentReq of jobApp.paymentRequests) {
          paymentReq.status = 1; // Đã duyệt
          paymentReq.approvedAt = new Date();
          await paymentReq.save();
        }
      }

      updatedCount++;
    }

    console.log(`[Payment Scheduler] Đã cập nhật ${updatedCount} job applications và payment requests`);
    return updatedCount;
  } catch (error) {
    console.error('[Payment Scheduler] Error:', error);
    throw error;
  }
}

/**
 * Khởi chạy scheduler (chạy mỗi ngày một lần)
 */
export function startPaymentScheduler() {
  // Chạy ngay lập tức
  checkAndUpdatePaymentStatus().catch(console.error);

  // Sau đó chạy mỗi 24 giờ
  setInterval(() => {
    checkAndUpdatePaymentStatus().catch(console.error);
  }, 24 * 60 * 60 * 1000); // 24 giờ

  console.log('[Payment Scheduler] Đã khởi động scheduler kiểm tra thanh toán');
}

