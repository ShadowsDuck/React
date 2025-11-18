// src/components/CardListView.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { mockEvents, mockConflicts } from '../lib/mock-data';
import {
  ChevronDown,
  AlertCircle,
  Lock,
  X,
  Clock,
  Users,
  Briefcase,
  Calendar,
  Search,
  UserPlus,
  MapPin,
  FileText,
  Check,
  Star,
  Zap,
} from 'lucide-react';
import { parse, format, isWithinInterval, set } from 'date-fns';

// Re-usable MultiSelectCompany component
const MultiSelectCompany = ({ companies, selectedCompanies, onChange, placeholder = "Select Companies" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (company) => {
    const newSelection = new Set(selectedCompanies);
    if (newSelection.has(company)) {
      newSelection.delete(company);
    } else {
      newSelection.add(company);
    }
    onChange(Array.from(newSelection));
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      onChange([]);
    } else {
      onChange(companies);
    }
  };

  const displayValue = useMemo(() => {
    if (selectedCompanies.length === 0) return placeholder;
    if (selectedCompanies.length === companies.length) return 'All Companies';
    return `${selectedCompanies.length} Selected`;
  }, [selectedCompanies, companies, placeholder]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 pr-8 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-between w-full"
      >
        <span>{displayValue}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-md bg-gray-800 shadow-lg border border-gray-700 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="p-2 border-b border-gray-700 sticky top-0 bg-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2">
            <label className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 rounded"
                checked={selectedCompanies.length === companies.length}
                onChange={handleSelectAll}
              />
              <span className="ml-2">Select All</span>
            </label>
            {filteredCompanies.map((company) => (
              <label
                key={company}
                className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 rounded"
                  checked={selectedCompanies.includes(company)}
                  onChange={() => handleSelect(company)}
                />
                <span className="ml-2">{company}</span>
              </label>
            ))}
            {filteredCompanies.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">No companies found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Change Staff Popup Component - เวอร์ชันสมบูรณ์
const ChangeStaffPopup = ({ isOpen, onClose, conflictEvent, currentStaff, currentEvent }) => {
  const [selectedReplacement, setSelectedReplacement] = useState('');
  const [targetEvent, setTargetEvent] = useState('currentEvent');

  if (!isOpen) return null;

  // หาตำแหน่งของ staff ที่ขัดแย้งในแต่ละ Event
  const getStaffPositionInEvent = (event, staffName) => {
    const staff = event?.staff?.find(s => s.name === staffName);
    return staff?.position || 'Staff';
  };

  const currentEventPosition = getStaffPositionInEvent(currentEvent, currentStaff);
  const conflictEventPosition = getStaffPositionInEvent(conflictEvent, currentStaff);

  // ตำแหน่งใน Event ปลายทางที่เลือก
  const targetPosition = targetEvent === 'currentEvent' ? currentEventPosition : conflictEventPosition;

  // ข้อมูล staff ใน event ปัจจุบัน (จัดกลุ่มตาม position)
  const getStaffByPosition = (staff) => {
    const grouped = {};
    staff.forEach(({ name, position }) => {
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(name);
    });
    return grouped;
  };

  const currentEventStaffByPosition = getStaffByPosition(currentEvent?.staff || []);

  // ข้อมูล staff ใน event ที่ขัดแย้ง (สมมติข้อมูล)
  const conflictEventStaff = [
    { name: 'John Smith', position: 'Designer' },
    { name: 'Emily Davis', position: 'Lead' },
    { name: 'Michael Brown', position: 'Technician' },
    // { name: currentStaff, position: conflictEventPosition }
  ];
  const conflictEventStaffByPosition = getStaffByPosition(conflictEventStaff);

  // Staff ที่ว่างอยู่สำหรับตำแหน่งนั้น
  const availableStaff = {
    'Host': [
      { name: 'Sarah Wilson', experience: '5 years', rating: 4.8, status: 'available' },
      { name: 'David Chen', experience: '3 years', rating: 4.6, status: 'available' },
    ],
    'Designer': [
      { name: 'Alex Turner', experience: '3 years', rating: 4.6, status: 'available' },
      { name: 'Maria Garcia', experience: '2 years', rating: 4.4, status: 'available' }
    ],
    'Technician': [
      { name: 'Robert Kim', experience: '2 years', rating: 4.5, status: 'available' },
      { name: 'Lisa Wang', experience: '4 years', rating: 4.7, status: 'available' }
    ],
    'Lead': [
      { name: 'James Wilson', experience: '6 years', rating: 4.9, status: 'available' }
    ]
  };

  const availableStaffForPosition = availableStaff[targetPosition] || [];

  const handleConfirm = () => {
    const eventToReplace = targetEvent === 'currentEvent' ? currentEvent : conflictEvent;
    const eventToKeep = targetEvent === 'currentEvent' ? conflictEvent : currentEvent;

    console.log(`Staff ใหม่: ${selectedReplacement}`);
    console.log(`แทนที่ใน: ${eventToReplace?.name}`);
    console.log(`คงไว้ใน: ${eventToKeep?.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">แก้ไข Staff ที่ขัดแย้ง</h3>
                <p className="text-gray-400 text-sm">คลิกที่ Event เพื่อเลือกว่าจะให้ Staff ใหม่ไปทำงาน Event ไหน</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            เลือก Event ที่ต้องการ Staff ใหม่
          </h4>
          {/* Event Comparison Header - ทำให้คลิกได้ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Event - คลิกได้ */}
            <div
              onClick={() => setTargetEvent('currentEvent')}
              className={`bg-gradient-to-r rounded-xl p-5 border cursor-pointer transition-all ${targetEvent === 'currentEvent'
                ? 'from-blue-900/40 to-blue-800/30 border-blue-500 shadow-lg'
                : 'from-blue-900/30 to-blue-800/20 border-blue-700 hover:border-blue-500'
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${targetEvent === 'currentEvent' ? 'bg-blue-500' : 'bg-blue-600'
                  }`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{currentEvent?.name}</h4>
                  <p className="text-blue-300 text-sm">{currentEvent?.company} • {currentEvent?.time}</p>
                </div>
                {targetEvent === 'currentEvent' && (
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                      ✅ เลือกแล้ว
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">สถานที่:</span>
                  <span className="text-white">Conference Room A</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ประเภท:</span>
                  <span className="text-white">Offline Event</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ตำแหน่ง {currentStaff}:</span>
                  <span className="text-blue-400 font-medium">{currentEventPosition}</span>
                </div>
              </div>
            </div>

            {/* Conflict Event - คลิกได้ */}
            <div
              onClick={() => setTargetEvent('conflictEvent')}
              className={`bg-gradient-to-r rounded-xl p-5 border cursor-pointer transition-all ${targetEvent === 'conflictEvent'
                ? 'from-red-900/40 to-red-800/30 border-red-500 shadow-lg'
                : 'from-red-900/30 to-red-800/20 border-red-700 hover:border-red-500'
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${targetEvent === 'conflictEvent' ? 'bg-red-500' : 'bg-red-600'
                  }`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{conflictEvent?.name}</h4>
                  <p className="text-red-300 text-sm">{conflictEvent?.company} • {conflictEvent?.time}</p>
                </div>
                {targetEvent === 'conflictEvent' && (
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                      ✅ เลือกแล้ว
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">สถานที่:</span>
                  <span className="text-white">Main Hall B</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ประเภท:</span>
                  <span className="text-white">Hybrid Event</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ตำแหน่ง {currentStaff}:</span>
                  <span className="text-red-400 font-medium">{conflictEventPosition}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-300 font-semibold">
                  {targetEvent === 'currentEvent'
                    ? `กำลังเลือก Staff ใหม่สำหรับ ${currentEvent?.name}`
                    : `กำลังเลือก Staff ใหม่สำหรับ ${conflictEvent?.name}`
                  }
                </p>
                <p className="text-yellow-200 text-sm">
                  {targetEvent === 'currentEvent'
                    ? `Staff ใหม่จะไปทำงานใน ${currentEvent?.name} และ ${currentStaff} จะคงอยู่ใน ${conflictEvent?.name}`
                    : `Staff ใหม่จะไปทำงานใน ${conflictEvent?.name} และ ${currentStaff} จะคงอยู่ใน ${currentEvent?.name}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Staff Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Event Staff */}
            <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Staff ใน {currentEvent?.name}
              </h4>
              <div className="space-y-4">
                {Object.entries(currentEventStaffByPosition).map(([position, names]) => (
                  <div key={position} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-300 uppercase">{position}</p>
                      {position === currentEventPosition && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                          ตำแหน่งขัดแย้ง
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {names.map((name, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${name === currentStaff
                            ? 'bg-red-900/20 border-red-600'
                            : 'bg-gray-600 border-gray-500'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{name}</p>
                            </div>
                            {name === currentStaff && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                ขัดแย้ง
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conflict Event Staff */}
            <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                Staff ใน {conflictEvent?.name}
              </h4>
              <div className="space-y-4">
                {Object.entries(conflictEventStaffByPosition).map(([position, names]) => (
                  <div key={position} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-red-300 uppercase">{position}</p>
                      {names.includes(currentStaff) && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                          ตำแหน่งขัดแย้ง
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {names.map((name, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${name === currentStaff
                            ? 'bg-red-900/20 border-red-600'
                            : 'bg-gray-600 border-gray-500'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{name}</p>
                            </div>
                            {name === currentStaff && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                ขัดแย้ง
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Available Staff Selection */}
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-white text-lg">
                  เลือก {targetPosition} ใหม่สำหรับ{' '}
                  <span className="text-blue-400">
                    {targetEvent === 'currentEvent' ? currentEvent?.name : conflictEvent?.name}
                  </span>
                </h4>
              </div>
              <span className="text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                {targetPosition}
              </span>
            </div>

            {availableStaffForPosition.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableStaffForPosition.map((staff, index) => (
                  <div
                    key={index}
                    onClick={() => staff.status === 'available' && setSelectedReplacement(staff.name)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedReplacement === staff.name
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      } ${staff.status === 'busy' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{staff.name}</p>
                          <p className="text-gray-400 text-sm">{targetPosition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{staff.rating}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${staff.status === 'available'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-yellow-900 text-yellow-300'
                          }`}>
                          {staff.status === 'available' ? 'พร้อมทำงาน' : 'ไม่ว่าง'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">ประสบการณ์:</span>
                      <span className="text-white">{staff.experience}</span>
                    </div>

                    {selectedReplacement === staff.name && (
                      <div className="mt-3 p-2 bg-blue-900/30 rounded border border-blue-700">
                        <p className="text-blue-300 text-sm text-center">
                          ✓ จะแทนที่ {currentStaff} ในตำแหน่ง {targetPosition}
                        </p>
                      </div>
                    )}

                    {staff.status === 'busy' && (
                      <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-700">
                        <p className="text-yellow-300 text-sm text-center">
                          ⚠️ ไม่สามารถเลือกได้
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>ไม่มี {targetPosition} ที่ว่างอยู่ในขณะนี้</p>
                <p className="text-sm mt-1">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
              </div>
            )}
          </div>

          {/* Action Summary */}
          {selectedReplacement && (
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700">
              <h4 className="font-semibold text-purple-300 text-lg mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                สรุปการเปลี่ยนแปลง
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Staff ใหม่:</p>
                  <p className="text-green-300 font-medium">{selectedReplacement}</p>
                  <p className="text-gray-400 text-xs">ตำแหน่ง {targetPosition}</p>
                </div>
                <div>
                  <p className="text-gray-400">ทำงานใน:</p>
                  <p className="text-blue-300 font-medium">
                    {targetEvent === 'currentEvent' ? currentEvent?.name : conflictEvent?.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-600">
                <p className="text-white text-sm">
                  <span className="text-green-400">✓</span> {currentStaff} จะคงอยู่ใน{' '}
                  {targetEvent === 'currentEvent' ? conflictEvent?.name : currentEvent?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {selectedReplacement ? (
                <span>
                  Staff ใหม่: <span className="text-green-400 font-medium">{selectedReplacement}</span> →{' '}
                  <span className="text-blue-400 font-medium">
                    {targetEvent === 'currentEvent' ? currentEvent?.name : conflictEvent?.name}
                  </span>
                </span>
              ) : (
                <span>คลิกที่ Event และเลือก Staff ใหม่</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedReplacement}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedReplacement
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <UserPlus className="w-4 h-4" />
                ยืนยันการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function CardListView() {
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [sortBy, setSortBy] = useState('conflicts');
  const [globalFilterCompany, setGlobalFilterCompany] = useState('all');
  const [changeStaffPopup, setChangeStaffPopup] = useState({
    isOpen: false,
    conflictEvent: null,
    currentStaff: '',
    currentEvent: null,
  });

  // State to manage ALL filters for the *currently expanded card*
  const [expandedCardFilters, setExpandedCardFilters] = useState({
    lockedStaffs: new Set(),
    hoveredStaff: null,
    conflictingEventsSearchTerm: '',
    conflictingEventsTimeFilter: { start: '', end: '' },
    conflictingEventsSelectedCompanies: [],
  });

  // Memoize all unique companies for the global filter dropdown
  const allCompanies = useMemo(() => Array.from(new Set(mockEvents.map((e) => e.company))), []);

  const getConflictCount = (eventId) => {
    return mockConflicts.filter((c) => c.event1 === eventId || c.event2 === eventId).length;
  };

  const getConflictingStaff = (eventId) => {
    return [...new Set(mockConflicts
      .filter((c) => c.event1 === eventId || c.event2 === eventId)
      .map((c) => c.person))];
  };

  // Modified to accept all per-card filters for the "Conflicts with X other events" section
  const getConflictingEvents = (
    eventId,
    currentLockedStaffs,
    currentHoveredStaff,
    searchTerm,
    timeFilter,
    selectedCompanies
  ) => {
    const conflictIds = new Set();
    mockConflicts.forEach((c) => {
      if (c.event1 === eventId) conflictIds.add(c.event2);
      if (c.event2 === eventId) conflictIds.add(c.event1);
    });

    let events = Array.from(conflictIds)
      .map((id) => mockEvents.find((e) => e.id === id))
      .filter(Boolean);

    // 1. Filter by Staff (locked or hovered)
    const staffsToFilter = currentLockedStaffs.size > 0
      ? currentLockedStaffs
      : (currentHoveredStaff ? new Set([currentHoveredStaff]) : new Set());

    if (staffsToFilter.size > 0) {
      events = events.filter((event) =>
        Array.from(staffsToFilter).some((staff) =>
          mockConflicts.some(
            (c) =>
              c.person === staff &&
              ((c.event1 === eventId && c.event2 === event?.id) ||
                (c.event1 === event?.id && c.event2 === eventId))
          )
        )
      );
    }

    // 2. Filter by Search Term (event name)
    if (searchTerm) {
      events = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Filter by Time Range - ใช้ date-fns อย่างถูกต้อง
    if (timeFilter.start && timeFilter.end) {
      // แปลง string เป็น Date object (ใช้ปี 2000 เป็น dummy year)
      const filterStart = parse(timeFilter.start, 'HH:mm', new Date(2000, 0, 1));
      const filterEnd = parse(timeFilter.end, 'HH:mm', new Date(2000, 0, 1));
      events = events.filter((e) => {
        const match = e.time.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
        if (!match) return true;
        const [, startStr, endStr] = match;
        const eventStart = parse(startStr, 'HH:mm', new Date(2000, 0, 1));
        const eventEnd = parse(endStr, 'HH:mm', new Date(2000, 0, 1));
        // เลือกโหมดที่ต้องการได้ที่นี่
        const hasOverlap = eventStart <= filterEnd && eventEnd >= filterStart;
        return hasOverlap;
      });
    }

    // 4. Filter by Selected Companies
    if (selectedCompanies.length > 0 && selectedCompanies.length < allCompanies.length) {
      events = events.filter(event => selectedCompanies.includes(event.company));
    }

    return events;
  };

  const getStaffByPosition = (staff) => {
    const grouped = {};
    staff.forEach(({ name, position }) => {
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(name);
    });
    return grouped;
  };

  const getCompanyColor = (company) => {
    const colors = {
      'Tech Corp': 'from-blue-600 to-blue-700',
      'Global Solutions': 'from-purple-600 to-purple-700',
      'Healthcare Plus': 'from-pink-600 to-pink-700',
      'Retail Co': 'from-amber-600 to-amber-700',
      'Finance Ltd': 'from-emerald-600 to-emerald-700',
      'Innovate Inc': 'from-cyan-600 to-cyan-700',
      'Innovate LLC': 'from-orange-600 to-orange-700',
      'Media Inc': 'from-teal-600 to-teal-700',
    };
    return colors[company] || 'from-slate-600 to-slate-700';
  };

  const getCompanyBadgeColor = (company) => {
    const colors = {
      'Tech Corp': 'bg-blue-800 text-blue-200 border-blue-700',
      'Global Solutions': 'bg-purple-800 text-purple-200 border-purple-700',
      'Healthcare Plus': 'bg-pink-800 text-pink-200 border-pink-700',
      'Retail Co': 'bg-amber-800 text-amber-200 border-amber-700',
      'Finance Ltd': 'bg-emerald-800 text-emerald-200 border-emerald-700',
      'Innovate Inc': 'bg-cyan-800 text-cyan-200 border-cyan-700',
      'Innovate LLC': 'bg-orange-800 text-orange-200 border-orange-700',
      'Media Inc': 'bg-teal-800 text-teal-200 border-teal-700',
    };
    return colors[company] || 'bg-slate-700 text-slate-300 border-slate-600';
  };

  const getSortedEvents = useMemo(() => {
    let events = [...mockEvents];
    if (globalFilterCompany !== 'all') {
      events = events.filter((e) => e.company === globalFilterCompany);
    }
    if (sortBy === 'conflicts') {
      return events.sort((a, b) => getConflictCount(b.id) - getConflictCount(a.id));
    } else if (sortBy === 'time') {
      return events.sort((a, b) => a.time.localeCompare(b.time));
    }
    return events.sort((a, b) => a.name.localeCompare(b.name));
  }, [globalFilterCompany, sortBy, mockEvents, mockConflicts]);

  // Handlers for staff filtering *within the expanded card*
  const toggleStaffLock = (staff) => {
    setExpandedCardFilters((prev) => {
      const newLockedStaffs = new Set(prev.lockedStaffs);
      if (newLockedStaffs.has(staff)) {
        newLockedStaffs.delete(staff);
      } else {
        newLockedStaffs.add(staff);
      }
      return { ...prev, lockedStaffs: newLockedStaffs };
    });
  };

  const handleSetHoveredStaff = (staff) => {
    setExpandedCardFilters((prev) => ({ ...prev, hoveredStaff: staff }));
  };

  const handleClearHoveredStaff = () => {
    setExpandedCardFilters((prev) => ({ ...prev, hoveredStaff: null }));
  };

  const handleCardExpandToggle = (id) => {
    if (expandedCardId === id) {
      setExpandedCardId(null);
      // Reset ALL filters when card is collapsed
      setExpandedCardFilters({
        lockedStaffs: new Set(),
        hoveredStaff: null,
        conflictingEventsSearchTerm: '',
        conflictingEventsTimeFilter: { start: '', end: '' },
        conflictingEventsSelectedCompanies: [],
      });
    } else {
      setExpandedCardId(id);
      // Also reset filters when a new card is expanded
      setExpandedCardFilters({
        lockedStaffs: new Set(),
        hoveredStaff: null,
        conflictingEventsSearchTerm: '',
        conflictingEventsTimeFilter: { start: '', end: '' },
        conflictingEventsSelectedCompanies: [],
      });
    }
  };

  // Handlers for conflicting events filters *within the expanded card*
  const setConflictingEventsSearchTerm = (term) => {
    setExpandedCardFilters((prev) => ({ ...prev, conflictingEventsSearchTerm: term }));
  };

  const setConflictingEventsTimeFilter = (type, value) => {
    setExpandedCardFilters((prev) => ({
      ...prev,
      conflictingEventsTimeFilter: { ...prev.conflictingEventsTimeFilter, [type]: value },
    }));
  };

  const setConflictingEventsSelectedCompanies = (companies) => {
    setExpandedCardFilters((prev) => ({ ...prev, conflictingEventsSelectedCompanies: companies }));
  };

  const handleClearAllInternalFilters = () => {
    setExpandedCardFilters({
      lockedStaffs: new Set(),
      hoveredStaff: null,
      conflictingEventsSearchTerm: '',
      conflictingEventsTimeFilter: { start: '', end: '' },
      conflictingEventsSelectedCompanies: [],
    });
  };

  // Function to get staff conflicts details
  const getStaffConflictsDetails = (eventId, staffName) => {
    const staffConflicts = mockConflicts.filter(
      (c) => c.person === staffName && (c.event1 === eventId || c.event2 === eventId)
    );

    const conflictEvents = staffConflicts.map((c) => {
      const conflictEventId = c.event1 === eventId ? c.event2 : c.event1;
      return mockEvents.find((e) => e.id === conflictEventId);
    }).filter(Boolean);

    return conflictEvents;
  };

  // Handler for opening change staff popup
  const handleOpenChangeStaff = (conflictEvent, currentStaff, currentEvent) => {
    setChangeStaffPopup({
      isOpen: true,
      conflictEvent,
      currentStaff,
      currentEvent,
    });
  };

  // Handler for closing change staff popup
  const handleCloseChangeStaff = () => {
    setChangeStaffPopup({
      isOpen: false,
      conflictEvent: null,
      currentStaff: '',
      currentEvent: null,
    });
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Change Staff Popup */}
      <ChangeStaffPopup
        isOpen={changeStaffPopup.isOpen}
        onClose={handleCloseChangeStaff}
        conflictEvent={changeStaffPopup.conflictEvent}
        currentStaff={changeStaffPopup.currentStaff}
        currentEvent={changeStaffPopup.currentEvent}
      />

      {/* View Header */}
      <div className="mb-8 border-b border-gray-700 pb-6">
        <h2 className="text-3xl font-bold mb-3 text-white">Events Card View</h2>
        <p className="text-gray-400 text-base">
          Explore events and their conflicts. Click on a card to view detailed staff assignments and conflicting events.
        </p>
      </div>

      {/* Global Filter and Sort Controls */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-inner mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-300 font-semibold text-sm mr-1">Sort by:</span>
            <button
              onClick={() => setSortBy('conflicts')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === 'conflicts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
              Conflicts
            </button>
            <button
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === 'time'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
              Time
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === 'name'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
              Name
            </button>
          </div>
          <div className="relative">
            <select
              value={globalFilterCompany}
              onChange={(e) => setGlobalFilterCompany(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">All Companies</option>
              {allCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {getSortedEvents.length > 0 ? (
          getSortedEvents.map((event) => {
            const isExpanded = expandedCardId === event.id;
            const conflictCount = getConflictCount(event.id);
            const uniqueConflictingStaff = getConflictingStaff(event.id);
            const staffByPosition = getStaffByPosition(event.staff);

            // Get per-card filter states
            const {
              lockedStaffs,
              hoveredStaff,
              conflictingEventsSearchTerm,
              conflictingEventsTimeFilter,
              conflictingEventsSelectedCompanies,
            } = expandedCardFilters;

            // Only calculate conflicting events if the card is expanded, and pass all specific filters
            const conflictingEvents = isExpanded
              ? getConflictingEvents(
                event.id,
                lockedStaffs,
                hoveredStaff,
                conflictingEventsSearchTerm,
                conflictingEventsTimeFilter,
                conflictingEventsSelectedCompanies
              )
              : [];

            const isAnyInternalFilterActive =
              lockedStaffs.size > 0 ||
              hoveredStaff !== null ||
              conflictingEventsSearchTerm !== '' ||
              conflictingEventsTimeFilter.start !== '' ||
              conflictingEventsTimeFilter.end !== '' ||
              conflictingEventsSelectedCompanies.length > 0;

            return (
              <div
                key={event.id}
                className={`rounded-xl border transition-all duration-300 ${isExpanded ? `border-blue-500 shadow-xl shadow-blue-900/20` : 'border-gray-700 hover:border-gray-600'
                  } overflow-hidden`}
              >
                {/* Card Header - Always Visible */}
                <div
                  className={`w-full transition-all duration-300 ${isExpanded
                    ? `bg-gradient-to-r ${getCompanyColor(event.company)}`
                    : 'bg-gray-850 hover:bg-gray-800'
                    }`}
                >
                  <button
                    onClick={() => handleCardExpandToggle(event.id)}
                    className="w-full px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-left"
                  >
                    <div className="flex-1 flex items-center gap-4 mb-3 sm:mb-0">
                      {/* Status Indicator */}
                      {conflictCount > 0 ? (
                        <div className="relative flex items-center justify-center w-9 h-9 bg-red-600 rounded-full text-white text-sm font-bold shadow-md animate-pulse-slow">
                          {conflictCount}
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center w-9 h-9 bg-green-600 rounded-full text-white text-sm font-bold shadow-md">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {/* Event Details */}
                      <div className="flex-1 text-left">
                        <h3 className={`font-extrabold text-xl ${isExpanded ? 'text-white' : 'text-gray-50'}`}>
                          {event.name}
                        </h3>
                        <div className={`flex items-center gap-3 mt-1 ${isExpanded ? 'text-blue-100' : 'text-gray-400'}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{event.time}</span>
                          <Briefcase className="w-4 h-4 ml-2" />
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCompanyBadgeColor(event.company)}`}>
                            {event.company}
                          </span>
                          {conflictCount === 0 && (
                            <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              No Conflicts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right Section - Status and Expand Button */}
                    <div className="flex items-center gap-3 sm:ml-auto">
                      {conflictCount > 0 ? (
                        <span className={`text-lg font-semibold ${isExpanded ? 'text-white' : 'text-red-400'}`}>
                          {conflictCount} Conflict{conflictCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className={`text-lg font-semibold ${isExpanded ? 'text-white' : 'text-green-400'}`}>
                          Ready
                        </span>
                      )}
                      <ChevronDown
                        className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-400'
                          }`}
                      />
                    </div>
                  </button>

                  {/* Preview Section - Only show when NOT expanded */}
                  {!isExpanded && (
                    <div className="px-6 pb-4 border-t border-gray-700 pt-3 bg-gray-850">
                      {conflictCount > 0 ? (
                        // Conflict Preview
                        <div>
                          <div className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Conflicts Issues
                          </div>
                          <ul className="space-y-1 text-sm">
                            {uniqueConflictingStaff.slice(0, 3).map((staff) => {
                              const staffConflicts = mockConflicts.filter(
                                (c) =>
                                  c.person === staff &&
                                  (c.event1 === event.id || c.event2 === event.id)
                              );
                              const conflictEventIds = staffConflicts.map((c) =>
                                c.event1 === event.id ? c.event2 : c.event1
                              );
                              const conflictEventNames = conflictEventIds
                                .map((id) => mockEvents.find((e) => e.id === id)?.name)
                                .filter(Boolean);
                              return (
                                <li key={staff} className="text-red-300">
                                  • <span className="font-medium">{staff}</span> conflict{' '}
                                  <span className="text-red-400 font-semibold">({conflictEventNames.length} event{conflictEventNames.length !== 1 ? 's' : ''})</span>{' '}
                                  with {conflictEventNames.slice(0, 2).join(', ')}
                                  {conflictEventNames.length > 2 && ` +${conflictEventNames.length - 2} more`}
                                </li>
                              );
                            })}
                            {uniqueConflictingStaff.length > 3 && (
                              <li className="text-red-300 italic">
                                +{uniqueConflictingStaff.length - 3} more staff conflicts...
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        // No Conflict Preview - Show event summary
                        <div className="space-y-3">
                          <div className="text-green-400 font-semibold text-sm flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Event Ready - All systems go!
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-300">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span>Staff: {event.staff.length} people</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-green-400" />
                                <span>Location: Ready</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-300">
                                <Briefcase className="w-4 h-4 text-purple-400" />
                                <span>Equipment: Complete</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <FileText className="w-4 h-4 text-yellow-400" />
                                <span>Documents: Ready</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="bg-gray-900 border-t border-gray-700 p-6 space-y-6">
                    {conflictCount > 0 ? (
                      // Conflict View
                      <>
                        {/* Action Required Section */}
                        <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-xl p-5">
                          <h4 className="font-bold text-red-300 mb-4 text-xl flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Action Required ({uniqueConflictingStaff.length} People)
                          </h4>
                          <div className="space-y-3">
                            {uniqueConflictingStaff.map((staff) => {
                              const conflictEvents = getStaffConflictsDetails(event.id, staff);
                              const staffPosition = event.staff.find(s => s.name === staff)?.position || 'Staff';

                              return (
                                <div key={staff} className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-red-800 border-opacity-50">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                                      {uniqueConflictingStaff.indexOf(staff) + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium bg-red-800 bg-opacity-50 text-red-200 px-2 py-1 rounded">
                                          [{staffPosition}]
                                        </span>
                                        <span className="font-semibold text-red-200">{staff}</span>
                                      </div>
                                      <div className="space-y-2">
                                        {conflictEvents.map((conflictEvent, index) => (
                                          <div key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2 text-sm">
                                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                              <span className="text-red-300">Conflict with</span>
                                              <span className="font-medium text-white">"{conflictEvent.name}"</span>
                                              <span className="text-gray-400 text-xs">
                                                {conflictEvent.time} • {conflictEvent.company}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => handleOpenChangeStaff(conflictEvent, staff, event)}
                                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 shadow-md"
                                            >
                                              เปลี่ยนคน
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Staff Assigned Section */}
                        <div>
                          <h4 className="font-bold text-gray-100 mb-4 text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" /> Staff Assigned
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(staffByPosition).map(([position, names]) => (
                              <div key={position} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner">
                                <p className="text-sm font-semibold text-blue-300 uppercase mb-2">{position}</p>
                                <div className="flex flex-wrap gap-2">
                                  {names.map((name) => {
                                    const isConflicting = uniqueConflictingStaff.includes(name) && conflictCount > 0;
                                    return (
                                      <span
                                        key={name}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isConflicting
                                          ? 'bg-red-700 bg-opacity-40 text-red-100 border border-red-600'
                                          : 'bg-gray-700 text-gray-100 border border-gray-600'
                                          }`}
                                      >
                                        {name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      // No Conflict View
                      <>
                        {/* Event Status Banner */}
                        <div className="bg-green-900 bg-opacity-20 border border-green-800 rounded-xl p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-green-300 text-xl">Event Ready</h4>
                                <p className="text-green-200 text-sm">All systems operational - No conflicts detected</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-300 font-semibold">Status: Ready</div>
                              <div className="text-green-200 text-sm">All staff confirmed</div>
                            </div>
                          </div>
                        </div>

                        {/* Staff Assigned - Complete View */}
                        <div>
                          <h4 className="font-bold text-gray-100 mb-4 text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" /> Staff Assigned
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(staffByPosition).map(([position, names]) => (
                              <div key={position} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-semibold text-blue-300 uppercase">{position}</p>
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                    {names.length} assigned
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {names.map((name) => (
                                    <span
                                      key={name}
                                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-700 bg-opacity-20 text-green-100 border border-green-600"
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-gray-400 bg-gray-800 rounded-xl border border-gray-700">
            <p className="font-bold text-xl mb-2">No events to display</p>
            <p className="text-base">Please adjust your filters or sort options to see events.</p>
          </div>
        )}
      </div>
    </div>
  );
}