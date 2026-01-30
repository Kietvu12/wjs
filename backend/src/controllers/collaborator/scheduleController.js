import {
  Calendar,
  JobApplication,
  Job,
  Company
} from '../../models/index.js';
import { Op } from 'sequelize';

/**
 * Schedule Controller (CTV)
 * CTV có thể xem lịch hẹn của mình (interviews và naitei)
 */
export const scheduleController = {
  /**
   * Get schedule for CTV (interviews and naitei)
   * GET /api/ctv/calendars/schedule
   */
  getSchedule: async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const collaboratorId = req.collaborator.id;

      // Validate month and year
      const currentDate = new Date();
      const queryMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const queryYear = year ? parseInt(year) : currentDate.getFullYear();

      // Calculate start and end of month
      const startDate = new Date(queryYear, queryMonth - 1, 1);
      const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);

      // Build where clause
      const where = {
        collaboratorId: collaboratorId,
        startAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      };

      // Get all calendars for the month
      const calendars = await Calendar.findAll({
        where,
        include: [
          {
            model: JobApplication,
            as: 'jobApplication',
            required: false,
            attributes: ['id', 'status'],
            include: [
              {
                model: Job,
                as: 'job',
                required: false,
                attributes: ['id', 'title', 'jobCode'],
                include: [
                  {
                    model: Company,
                    as: 'company',
                    required: false,
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          }
        ],
        order: [['startAt', 'ASC']],
        paranoid: true
      });

      // Separate interviews (eventType = 1) and naitei (eventType = 2)
      const interviews = [];
      const naitei = [];

      calendars.forEach(calendar => {
        const calendarData = calendar.toJSON();
        
        // Format data for frontend
        const formattedEvent = {
          id: calendarData.id,
          name: calendarData.title,
          description: calendarData.description || '',
          interviewDate: calendarData.startAt,
          interviewTime: calendarData.startAt ? new Date(calendarData.startAt).toTimeString().slice(0, 5) : '00:00',
          naiteiDate: calendarData.eventType === 2 ? calendarData.startAt : null,
          naiteiTime: calendarData.eventType === 2 && calendarData.startAt ? new Date(calendarData.startAt).toTimeString().slice(0, 5) : null,
          role: calendarData.jobApplication?.job?.title || '',
          job: calendarData.jobApplication?.job || null,
          status: calendarData.status,
          eventType: calendarData.eventType
        };

        if (calendarData.eventType === 1) {
          // Interview
          interviews.push(formattedEvent);
        } else if (calendarData.eventType === 2) {
          // Naitei
          naitei.push(formattedEvent);
        }
      });

      res.json({
        success: true,
        data: {
          interviews,
          naitei,
          month: queryMonth,
          year: queryYear
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

