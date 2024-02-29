export class CalendarDataResponse {
  day: string;
  value: number;

  static fromCalendarEntity({ day, value }: { day: string; value: number }) {
    const response = new CalendarDataResponse();

    response.day = day;
    response.value = value;

    return response;
  }
}
