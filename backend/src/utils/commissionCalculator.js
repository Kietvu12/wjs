import {
  Job,
  JobValue,
  JobCampaign,
  Campaign,
  Collaborator,
  RankLevel,
  CVStorage,
  Type,
  Value
} from '../models/index.js';

/**
 * Tính toán hoa hồng cho CTV hoặc Admin
 * @param {Object} params - Tham số tính toán
 * @param {number} params.jobId - ID của job
 * @param {number} params.jobApplicationId - ID của job application
 * @param {number} params.monthlySalary - Lương tháng (万円)
 * @param {number} params.collaboratorId - ID của CTV (null nếu là Admin)
 * @param {string} params.cvCode - Mã CV của ứng viên
 * @returns {Promise<number>} - Số tiền hoa hồng (VND)
 */
export async function calculateCommission({
  jobId,
  jobApplicationId,
  monthlySalary,
  collaboratorId = null,
  cvCode = null
}) {
  try {
    // Load job với các relations cần thiết
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: JobValue,
          as: 'jobValues',
          required: false,
          include: [
            {
              model: Type,
              as: 'type',
              required: false
            },
            {
              model: Value,
              as: 'valueRef',
              required: false
            }
          ]
        },
        {
          model: JobCampaign,
          as: 'jobCampaigns',
          required: false,
          include: [
            {
              model: Campaign,
              as: 'campaign',
              required: false
            }
          ]
        }
      ]
    });

    if (!job) {
      throw new Error('Job không tồn tại');
    }

    const monthlySalaryNum = parseFloat(monthlySalary) || 0;
    const annualSalary = monthlySalaryNum * 12; // 万円/năm

    // Kiểm tra nếu job thuộc campaign
    const activeCampaign = job.jobCampaigns?.find(jc => {
      const campaign = jc.campaign;
      if (!campaign) return false;
      const now = new Date();
      const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
      const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
      return campaign.status === 1 && 
             (!startDate || now >= startDate) && 
             (!endDate || now <= endDate);
    });

    // Nếu job thuộc campaign, dùng percent từ campaign
    if (activeCampaign && activeCampaign.campaign) {
      const campaignPercent = parseFloat(activeCampaign.campaign.percent) || 0;
      const platformCommission = annualSalary * (campaignPercent / 100);

      // Nếu là Admin tiến cử
      if (!collaboratorId) {
        return platformCommission; // Admin ăn đúng % sàn, không nhân level
      }

      // Nếu là CTV tiến cử
      const collaborator = await Collaborator.findByPk(collaboratorId, {
        include: [
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator || !collaborator.rankLevel) {
        throw new Error('CTV không có rank level');
      }

      const rankPercent = parseFloat(collaborator.rankLevel.percent) || 0;
      const ctvCommission = platformCommission * (rankPercent / 100);

      return ctvCommission;
    }

    // Nếu job không thuộc campaign, tính theo job_commission_type và job_values
    const jobValues = job.jobValues || [];

    // Kiểm tra ngoại lệ: typeId = 2, valueId = 6
    const exceptionValue6 = jobValues.find(jv => 
      jv.typeId === 2 && jv.valueId === 6
    );

    if (exceptionValue6) {
      // CTV trực tiếp nhận % theo level nhân với (monthly_salary * 12) hoặc số tiền nếu fixed
      if (!collaboratorId) {
        // Admin tiến cử
        if (job.jobCommissionType === 'fixed') {
          const fixedAmount = parseFloat(exceptionValue6.value) || 0;
          return fixedAmount; // Admin ăn đúng số tiền, không nhân level
        } else {
          // percent
          const percent = parseFloat(exceptionValue6.value) || 0;
          return annualSalary * (percent / 100);
        }
      }

      // CTV tiến cử
      const collaborator = await Collaborator.findByPk(collaboratorId, {
        include: [
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator || !collaborator.rankLevel) {
        throw new Error('CTV không có rank level');
      }

      const rankPercent = parseFloat(collaborator.rankLevel.percent) || 0;

      if (job.jobCommissionType === 'fixed') {
        const fixedAmount = parseFloat(exceptionValue6.value) || 0;
        return fixedAmount * (rankPercent / 100);
      } else {
        // percent
        const percent = parseFloat(exceptionValue6.value) || 0;
        return annualSalary * (percent / 100) * (rankPercent / 100);
      }
    }

    // Kiểm tra ngoại lệ: typeId = 2, valueId = 7
    const exceptionValue7 = jobValues.find(jv => 
      jv.typeId === 2 && jv.valueId === 7
    );

    if (exceptionValue7) {
      // Không cần so sánh JLPT hay gì cả
      if (!collaboratorId) {
        // Admin tiến cử
        if (job.jobCommissionType === 'fixed') {
          const fixedAmount = parseFloat(exceptionValue7.value) || 0;
          return fixedAmount;
        } else {
          const percent = parseFloat(exceptionValue7.value) || 0;
          return annualSalary * (percent / 100);
        }
      }

      // CTV tiến cử
      const collaborator = await Collaborator.findByPk(collaboratorId, {
        include: [
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator || !collaborator.rankLevel) {
        throw new Error('CTV không có rank level');
      }

      const rankPercent = parseFloat(collaborator.rankLevel.percent) || 0;

      if (job.jobCommissionType === 'fixed') {
        const fixedAmount = parseFloat(exceptionValue7.value) || 0;
        return fixedAmount * (rankPercent / 100);
      } else {
        const percent = parseFloat(exceptionValue7.value) || 0;
        return annualSalary * (percent / 100) * (rankPercent / 100);
      }
    }

    // Trường hợp thông thường: tính theo job_commission_type và job_values với điều kiện CV
    if (job.jobCommissionType === 'percent') {
      // Cần so sánh job_values với CV (jlptLevel, experienceYears)
      let matchedJobValue = null;

      if (cvCode) {
        const cv = await CVStorage.findOne({
          where: { code: cvCode }
        });

        if (cv) {
          // Tìm job_value phù hợp với điều kiện CV
          for (const jv of jobValues) {
            // TODO: Logic so sánh jlptLevel và experienceYears với value trong job_values
            // Tạm thời lấy job_value đầu tiên có type phù hợp
            if (jv.typeId && jv.valueId && jv.value) {
              matchedJobValue = jv;
              break;
            }
          }
        }
      }

      if (!matchedJobValue && jobValues.length > 0) {
        matchedJobValue = jobValues[0]; // Fallback: lấy job_value đầu tiên
      }

      if (!matchedJobValue || !matchedJobValue.value) {
        return 0; // Không có job_value phù hợp
      }

      const percent = parseFloat(matchedJobValue.value) || 0;
      const platformCommission = annualSalary * (percent / 100);

      // Nếu là Admin tiến cử
      if (!collaboratorId) {
        return platformCommission; // Admin ăn đúng % sàn
      }

      // Nếu là CTV tiến cử
      const collaborator = await Collaborator.findByPk(collaboratorId, {
        include: [
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator || !collaborator.rankLevel) {
        throw new Error('CTV không có rank level');
      }

      const rankPercent = parseFloat(collaborator.rankLevel.percent) || 0;
      const ctvCommission = platformCommission * (rankPercent / 100);

      return ctvCommission;
    } else {
      // job_commission_type = 'fixed'
      // Lấy số tiền từ job_value (nếu có)
      let fixedAmount = 0;

      if (jobValues.length > 0 && jobValues[0].value) {
        fixedAmount = parseFloat(jobValues[0].value) || 0;
      }

      // Nếu là Admin tiến cử
      if (!collaboratorId) {
        return fixedAmount; // Admin ăn đúng số tiền, không nhân level
      }

      // Nếu là CTV tiến cử
      const collaborator = await Collaborator.findByPk(collaboratorId, {
        include: [
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator || !collaborator.rankLevel) {
        throw new Error('CTV không có rank level');
      }

      const rankPercent = parseFloat(collaborator.rankLevel.percent) || 0;
      const ctvCommission = fixedAmount * (rankPercent / 100);

      return ctvCommission;
    }
  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
}

