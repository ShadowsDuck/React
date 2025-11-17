export interface Event {
  id: string
  name: string
  time: string
  company: string
  staff: StaffMember[]
}

export interface StaffMember {
  name: string
  position: string
}

export interface Conflict {
  event1: string
  event2: string
  person: string
}

export const mockEvents: Event[] = [
{
    id: 'e1',
    name: 'Product Launch #2',
    time: '09:00 - 12:00',
    company: 'Tech Corp',
    staff: [
      { name: 'Emily Davis', position: 'Project Manager' },
      { name: 'John Smith', position: 'Designer' },
      { name: 'Sarah Lee', position: 'Developer' },
      { name: 'Liam Chan', position: 'Designer' },
      { name: 'Emma Wong', position: 'Developer' }
    ]
  },

  {
    id: 'e2',
    name: 'Seminar #5',
    time: '09:20 - 11:00',
    company: 'Global Solutions',
    staff: [
      { name: 'Emily Davis', position: 'Presenter' },
      { name: 'Brian Clark', position: 'Facilitator' },
      { name: 'Anna Lee', position: 'Coordinator' },
      { name: 'Jacob Kim', position: 'Presenter' },
      { name: 'Sophia Park', position: 'Coordinator' }
    ]
  },

  {
    id: 'e3',
    name: 'Product Launch #6',
    time: '09:00 - 11:00',
    company: 'Innovate LLC',
    staff: [
      { name: 'Emily Davis', position: 'Lead' },
      { name: 'ABC', position: 'Lead' },
      { name: 'John Smith', position: 'Designer' },
      { name: 'Mike Chen', position: 'Developer' },
      { name: 'Lucas Gray', position: 'Designer' },
      { name: 'David Tan', position: 'Developer' }
    ]
  },

  {
    id: 'e4',
    name: 'Live Broadcast #3',
    time: '10:00 - 12:00',
    company: 'Healthcare Plus',
    staff: [
      { name: 'John Smith', position: 'Producer' },
      { name: 'Mike Chen', position: 'Technician' },
      { name: 'Sarah Lee', position: 'Host' },
      { name: 'Daniel Kim', position: 'Technician' },
      { name: 'Olivia Park', position: 'Host' }
    ]
  },

  {
    id: 'e5',
    name: 'Corporate Townhall #1',
    time: '11:00 - 13:00',
    company: 'Global Solutions',
    staff: [
      { name: 'Brian Clark', position: 'Speaker' },
      { name: 'Anna Lee', position: 'Coordinator' },
      { name: 'John Smith', position: 'Support' },
      { name: 'Sarah Lee', position: 'Speaker' },
      { name: 'Mike Chen', position: 'Support' }
    ]
  },

  {
    id: 'e6',
    name: 'Product Launch #4',
    time: '11:00 - 14:00',
    company: 'Innovate LLC',
    staff: [
      { name: 'Mike Chen', position: 'Lead Developer' },
      { name: 'Sarah Lee', position: 'QA Lead' },
      { name: 'Emily Davis', position: 'Manager' },
      { name: 'Kevin Liu', position: 'Lead Developer' },
      { name: 'Helen Ho', position: 'QA Lead' }
    ]
  },

  {
    id: 'e7',
    name: 'Corporate Townhall #12',
    time: '13:00 - 15:00',
    company: 'Media Inc',
    staff: [
      { name: 'Brian Clark', position: 'Speaker' },
      { name: 'John Smith', position: 'Facilitator' },
      { name: 'Anna Lee', position: 'Coordinator' },
      { name: 'Sarah Lee', position: 'Speaker' },
      { name: 'Kevin Liu', position: 'Facilitator' }
    ]
  },

  {
    id: 'e8',
    name: 'Workshop #7',
    time: '14:00 - 17:00',
    company: 'Media Inc',
    staff: [
      { name: 'Sarah Lee', position: 'Trainer' },
      { name: 'Mike Chen', position: 'Assistant' },
      { name: 'Brian Clark', position: 'Lead' },
      { name: 'Olivia Park', position: 'Assistant' },
      { name: 'James Ho', position: 'Lead' }
    ]
  },

  {
    id: 'e9',
    name: 'Corporate Townhall #8',
    time: '15:00 - 16:00',
    company: 'Tech Corp',
    staff: [
      { name: 'Emily Davis', position: 'Manager' },
      { name: 'John Smith', position: 'Presenter' },
      { name: 'Anna Lee', position: 'Support' },
      { name: 'Brian Clark', position: 'Presenter' },
      { name: 'Mike Chen', position: 'Support' }
    ]
  },

  {
    id: 'e10',
    name: 'Product Launch #9',
    time: '15:00 - 17:00',
    company: 'Global Solutions',
    staff: [
      { name: 'Brian Clark', position: 'Lead' },
      { name: 'Mike Chen', position: 'Developer' },
      { name: 'Sarah Lee', position: 'Tester' },
      { name: 'Lucas Gray', position: 'Developer' },
      { name: 'Emma Tan', position: 'Tester' }
    ]
  },

  {
    id: 'e11',
    name: 'Seminar #10',
    time: '15:30 - 17:00',
    company: 'Finance Ltd',
    staff: [
      { name: 'Emily Davis', position: 'Presenter' },
      { name: 'Brian Clark', position: 'Co-Presenter' },
      { name: 'John Smith', position: 'Support' },
      { name: 'Amy Lee', position: 'Presenter' },
      { name: 'Daniel Wong', position: 'Support' }
    ]
  },

  {
    id: 'e12',
    name: 'Conference #11',
    time: '16:00 - 17:00',
    company: 'Retail Co',
    staff: [
      { name: 'Sarah Lee', position: 'Speaker' },
      { name: 'Emily Davis', position: 'Panelist' },
      { name: 'Anna Lee', position: 'Moderator' },
      { name: 'Brian Clark', position: 'Speaker' },
      { name: 'Mike Chen', position: 'Panelist' }
    ]
  },

  {
    id: 'e13',
    name: 'Product Launch #13',
    time: '17:00 - 20:00',
    company: 'Retail Co',
    staff: [
      { name: 'John Smith', position: 'Lead' },
      { name: 'Mike Chen', position: 'Developer' },
      { name: 'Brian Clark', position: 'Manager' },
      { name: 'Lucas Gray', position: 'Lead' },
      { name: 'Kevin Lee', position: 'Developer' }
    ]
  },

  {
    id: 'e14',
    name: 'Product Launch #14',
    time: '17:30 - 19:00',
    company: 'Tech Corp',
    staff: [
      { name: 'Sarah Lee', position: 'Engineer' },
      { name: 'Emily Davis', position: 'PM' },
      { name: 'Anna Lee', position: 'Designer' },
      { name: 'John Tan', position: 'Engineer' },
      { name: 'Olivia Kim', position: 'Designer' }
    ]
  },

  {
    id: 'e15',
    name: 'Product Launch #15',
    time: '18:00 - 20:00',
    company: 'Healthcare Plus',
    staff: [
      { name: 'Emily Davis', position: 'Director' },
      { name: 'Brian Clark', position: 'Coordinator' },
      { name: 'John Smith', position: 'Specialist' },
      { name: 'Sarah Lee', position: 'Coordinator' },
      { name: 'Mike Chen', position: 'Specialist' }
    ]
  },

  {
    id: 'e16',
    name: 'Product Launch #16',
    time: '18:00 - 18:30',
    company: 'Retail Co',
    staff: [
      { name: 'Mike Chen', position: 'Tech Lead' },
      { name: 'Sarah Lee', position: 'QA' },
      { name: 'John Smith', position: 'Support' },
      { name: 'Anna Lee', position: 'QA' },
      { name: 'Daniel Kim', position: 'Support' }
    ]
  },

  {
    id: 'e17',
    name: 'Conference #17',
    time: '18:00 - 21:00',
    company: 'Innovate Inc',
    staff: [
      { name: 'Brian Clark', position: 'Organizer' },
      { name: 'Anna Lee', position: 'Host' },
      { name: 'Mike Chen', position: 'Technical' },
      { name: 'Emily Davis', position: 'Host' },
      { name: 'Lucas Gray', position: 'Organizer' }
    ]
  },

  // ------------ NEW EVENTS ----------------

  // 1) Event ที่มี staff ไม่ครบ
  {
    id: 'e18',
    name: 'Mini Workshop #18',
    time: '10:00 - 11:00',
    company: 'Startup Hub',
    staff: [
      { name: 'Emily Davis', position: 'Trainer' },
      // intentionally missing more staff
    ]
  },

  // 2) Event ที่ไม่มี conflict เลย
  {
    id: 'e19',
    name: 'Internal Meeting #19',
    time: '13:00 - 14:00',
    company: 'Local Co',
    staff: [
      { name: 'Tom Ford', position: 'Host' },
      { name: 'Jane Miller', position: 'Support' },
    ]
  },

  // 3) Event ที่บางคนมี conflict บางคนไม่มี
  {
    id: 'e20',
    name: 'Training Session #20',
    time: '14:00 - 16:00',
    company: 'Retail Co',
    staff: [
      { name: 'Emily Davis', position: 'Speaker' }, // มี conflict
      { name: 'John Smith', position: 'Assistant' }, // มี conflict
      { name: 'New Person', position: 'Observer' },  // ไม่มี conflict
    ]
  },
]

export const mockConflicts: Conflict[] = [
  { event1: 'e2', event2: 'e3', person: 'Emily Davis' },
  { event1: 'e3', event2: 'e6', person: 'Emily Davis' },
  { event1: 'e3', event2: 'e9', person: 'Emily Davis' },
  { event1: 'e6', event2: 'e9', person: 'Emily Davis' },
  { event1: 'e9', event2: 'e11', person: 'Emily Davis' },
  { event1: 'e11', event2: 'e12', person: 'Emily Davis' },
  { event1: 'e12', event2: 'e14', person: 'Emily Davis' },
  { event1: 'e14', event2: 'e15', person: 'Emily Davis' },

  { event1: 'e3', event2: 'e4', person: 'John Smith' },
  { event1: 'e4', event2: 'e5', person: 'John Smith' },
  { event1: 'e5', event2: 'e7', person: 'John Smith' },
  { event1: 'e7', event2: 'e9', person: 'John Smith' },
  { event1: 'e9', event2: 'e11', person: 'John Smith' },
  { event1: 'e11', event2: 'e13', person: 'John Smith' },
  { event1: 'e13', event2: 'e15', person: 'John Smith' },
  { event1: 'e15', event2: 'e16', person: 'John Smith' },
  
  // ---------------- NEW CONFLICTS for e20 ----------------
  { event1: 'e3', event2: 'e20', person: 'Emily Davis' },
  { event1: 'e5', event2: 'e20', person: 'John Smith' },

  // NEW PERSON intentionally has no conflicts
]
