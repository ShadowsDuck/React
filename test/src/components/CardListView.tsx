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
} from 'lucide-react';
import { parse, format, isWithinInterval, set } from 'date-fns';

// Re-usable MultiSelectCompany component, slightly adapted for per-card use
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
      onChange([]); // Deselect all
    } else {
      onChange(companies); // Select all
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


export function CardListView() {
  const [expandedCardId, setExpandedCardId] = useState(null); // Only one card can be expanded at a time
  const [sortBy, setSortBy] = useState('conflicts'); // 'conflicts' | 'name' | 'time'
  const [globalFilterCompany, setGlobalFilterCompany] = useState('all'); // Global company filter for the main list

  // State to manage ALL filters for the *currently expanded card*
  const [expandedCardFilters, setExpandedCardFilters] = useState({
    lockedStaffs: new Set(),
    hoveredStaff: null,
    conflictingEventsSearchTerm: '', // New: search within conflicting events
    conflictingEventsTimeFilter: { start: '', end: '' }, // New: time filter within conflicting events
    conflictingEventsSelectedCompanies: [], // New: multi-select companies within conflicting events
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
        // หรือแบบเข้มงวด (อยู่ในช่วงทั้งหมด)
        // const fullyContained = eventStart >= filterStart && eventEnd <= filterEnd;

        return hasOverlap; // ← เปลี่ยนเป็น fullyContained ถ้าอยากเข้มงวด
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
  }, [globalFilterCompany, sortBy, mockEvents, mockConflicts]); // Re-calculate when these change


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


  return (
    <div className="p-6 sm:p-8">
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
                      {/* Conflict Indicator */}
                      {conflictCount > 0 ? (
                        <div className="relative flex items-center justify-center w-9 h-9 bg-red-600 rounded-full text-white text-sm font-bold shadow-md animate-pulse-slow">
                          {conflictCount}
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center w-9 h-9 bg-green-600 rounded-full text-white text-sm font-bold shadow-md">
                          <span className="text-xl">✅</span>
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
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Conflict Count and Expand Button */}
                    <div className="flex items-center gap-3 sm:ml-auto">
                      {conflictCount > 0 && (
                        <span className={`text-lg font-semibold ${isExpanded ? 'text-white' : 'text-red-400'}`}>
                          {conflictCount} Conflict{conflictCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-400'
                          }`}
                      />
                    </div>
                  </button>

                  {/* Critical Issues Preview - Only show when NOT expanded */}
                  {!isExpanded && conflictCount > 0 && (
                    <div className="px-6 pb-4 border-t border-gray-700 pt-3 bg-gray-850">
                      <div className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Critical Issues
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
                  )}
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="bg-gray-900 border-t border-gray-700 p-6 space-y-6">
                    {/* Staff Assigned Section (Always present when expanded) */}
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
                                const isConflicting = uniqueConflictingStaff.includes(name) && conflictCount > 0; // Only highlight if there are conflicts
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

                    {/* Only show conflict-related sections if there are conflicts */}
                    {conflictCount > 0 ? (
                      <>
                        {/* Conflicting Staff Section */}
                        {uniqueConflictingStaff.length > 0 && (
                          <div className="pt-4 border-t border-gray-700">
                            <h4 className="font-bold text-gray-100 mb-3 text-xl flex items-center gap-2">
                              <Lock className="w-5 h-5 text-red-400" /> Conflicting Staff ({uniqueConflictingStaff.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {uniqueConflictingStaff.map((staff) => {
                                const isHovered = hoveredStaff === staff;
                                const isLocked = lockedStaffs.has(staff);
                                return (
                                  <button
                                    key={staff}
                                    onMouseEnter={() => lockedStaffs.size === 0 && handleSetHoveredStaff(staff)}
                                    onMouseLeave={() => lockedStaffs.size === 0 && handleClearHoveredStaff()}
                                    onClick={() => toggleStaffLock(staff)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer flex items-center gap-2 ${isLocked
                                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                      : isHovered
                                        ? 'bg-red-700 bg-opacity-60 text-red-100 border-red-500 scale-105 shadow-lg'
                                        : 'bg-red-800 bg-opacity-30 text-red-200 border-red-700 border-opacity-50 hover:bg-opacity-50'
                                      }`}
                                    title={isLocked ? `Filtering by ${staff}. Click to unlock.` : `Click to filter by ${staff}`}
                                  >
                                    {staff}
                                    {isLocked && <Lock className="w-3.5 h-3.5" />}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 italic">
                              Hover over a staff name to see their specific conflicts. Click to lock/unlock filter.
                            </p>
                          </div>
                        )}

                        {/* Conflicting Events Filters */}
                        <div className="pt-4 border-t border-gray-700 space-y-4">
                          <h4 className="font-bold text-gray-100 text-xl flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400" /> Conflicts with {conflictingEvents.length} other event{conflictingEvents.length !== 1 ? 's' : ''}
                            {(hoveredStaff || lockedStaffs.size > 0 || conflictingEventsSearchTerm || conflictingEventsTimeFilter.start || conflictingEventsTimeFilter.end || conflictingEventsSelectedCompanies.length > 0) && (
                              <span className="text-sm font-normal text-blue-300 ml-2">
                                (filtered)
                              </span>
                            )}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search by Event Name */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search event name..."
                                value={conflictingEventsSearchTerm}
                                onChange={(e) => setConflictingEventsSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Time Range Filter - ใช้ date-fns + dropdown 24 ชั่วโมง 100% */}
                            <div className="flex items-center gap-4 col-span-1 md:col-span-1">
                              {/* Start Time */}
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <select
                                  value={conflictingEventsTimeFilter.start}
                                  onChange={(e) => setConflictingEventsTimeFilter('start', e.target.value)}
                                  className="w-28 px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">เริ่ม</option>
                                  {Array.from({ length: 48 }, (_, i) => {
                                    const hour = String(Math.floor(i / 2)).padStart(2, '0');
                                    const minute = i % 2 === 0 ? '00' : '30';
                                    const time = `${hour}:${minute}`;
                                    return <option key={time} value={time}>{time}</option>;
                                  })}
                                </select>
                                {conflictingEventsTimeFilter.start && (
                                  <button onClick={() => setConflictingEventsTimeFilter('start', '')}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                  </button>
                                )}
                              </div>

                              <span className="text-gray-400">ถึง</span>

                              {/* End Time */}
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <select
                                  value={conflictingEventsTimeFilter.end}
                                  onChange={(e) => setConflictingEventsTimeFilter('end', e.target.value)}
                                  className="w-28 px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">สิ้นสุด</option>
                                  {Array.from({ length: 48 }, (_, i) => {
                                    const hour = String(Math.floor(i / 2)).padStart(2, '0');
                                    const minute = i % 2 === 0 ? '00' : '30';
                                    const time = `${hour}:${minute}`;
                                    return <option key={time} value={time}>{time}</option>;
                                  })}
                                </select>
                                {conflictingEventsTimeFilter.end && (
                                  <button onClick={() => setConflictingEventsTimeFilter('end', '')}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Multi-select Company Filter */}
                            <MultiSelectCompany
                              companies={allCompanies}
                              selectedCompanies={conflictingEventsSelectedCompanies}
                              onChange={setConflictingEventsSelectedCompanies}
                              placeholder="Filter by Company"
                            />
                          </div>
                          {isAnyInternalFilterActive && (
                            <div className="mt-4 text-right">
                              <button
                                onClick={handleClearAllInternalFilters}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-full flex items-center gap-1 transition-all ml-auto w-fit"
                                title="Clear all filters for this event's conflicts"
                              >
                                Clear All Filters <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>


                        {/* Conflicting Events List */}
                        <div className="pt-4 border-t border-gray-700">
                          {/* <h4 className="font-bold text-gray-100 mb-3 text-xl flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400" /> Conflicts with {conflictingEvents.length} other event{conflictingEvents.length !== 1 ? 's' : ''}
                            {(hoveredStaff || lockedStaffs.size > 0 || conflictingEventsSearchTerm || conflictingEventsTimeFilter.start || conflictingEventsTimeFilter.end || conflictingEventsSelectedCompanies.length > 0) && (
                              <span className="text-sm font-normal text-blue-300 ml-2">
                                (filtered)
                              </span>
                            )}
                          </h4> */}
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                            {conflictingEvents.length > 0 ? (
                              conflictingEvents.map((conflictEvent) => {
                                const sharedStaff = mockConflicts
                                  .filter(
                                    (c) =>
                                      (c.event1 === event.id && c.event2 === conflictEvent?.id) ||
                                      (c.event1 === conflictEvent?.id && c.event2 === event.id)
                                  )
                                  .map((c) => c.person);

                                return (
                                  <div
                                    key={conflictEvent?.id}
                                    className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition-all duration-200 shadow-sm"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-50 text-lg">{conflictEvent?.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                          <Clock className="w-4 h-4" /> {conflictEvent?.time}
                                          <Briefcase className="w-4 h-4 ml-2" />
                                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCompanyBadgeColor(conflictEvent.company)}`}>
                                            {conflictEvent?.company}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                          <Users className="w-4 h-4 text-gray-500" />
                                          <span className="font-medium">Shared Staff:</span> {sharedStaff.join(', ')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-gray-400 text-base py-3 text-center bg-gray-800 rounded-lg">
                                No conflicting events found with the current filters.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                          <button className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md">
                            Reschedule Event
                          </button>
                          <button className="flex-1 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md">
                            Mark Conflict Resolved
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-green-400 py-3 bg-green-900/20 rounded-lg justify-center">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-semibold text-lg">No conflicts detected for this event!</span>
                      </div>
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