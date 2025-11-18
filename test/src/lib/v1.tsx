// src/components/CardListView.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { mockEvents, mockConflicts } from "../lib/mock-data";
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
    Upload,
    Edit3,
    Trash2,
    Plus,
    Check,
} from "lucide-react";
import { parse, format, isWithinInterval, set } from "date-fns";

// Re-usable MultiSelectCompany component
const MultiSelectCompany = ({
    companies,
    selectedCompanies,
    onChange,
    placeholder = "Select Companies",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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
        if (selectedCompanies.length === companies.length) return "All Companies";
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
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
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
                            <p className="text-center text-gray-500 text-sm py-4">
                                No companies found.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Change Staff Popup Component
const ChangeStaffPopup = ({ isOpen, onClose, conflictEvent, currentStaff }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Change Staff Assignment
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Resolve scheduling conflict
                                </p>
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

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Current Conflict Info */}
                    <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <h4 className="font-semibold text-white text-sm mb-2">
                            Current Conflict
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Staff:</span>
                                <span className="text-white font-medium">{currentStaff}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Event:</span>
                                <span className="text-white">"{conflictEvent?.name}"</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Time:</span>
                                <span className="text-white">{conflictEvent?.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Company:</span>
                                <span className="text-white">{conflictEvent?.company}</span>
                            </div>
                        </div>
                    </div>

                    {/* Selection Area */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white text-sm">
                            Select Replacement Staff
                        </h4>

                        {/* Staff Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search available staff..."
                                className="w-full pl-10 pr-3 py-3 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Available Staff List */}
                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                            {[
                                "Sarah Wilson",
                                "Michael Brown",
                                "Jessica Lee",
                                "David Chen",
                                "Amanda Taylor",
                            ].map((staff) => (
                                <div
                                    key={staff}
                                    className="p-3 bg-gray-750 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium text-sm">{staff}</p>
                                            <p className="text-gray-400 text-xs">
                                                Available • No conflicts
                                            </p>
                                        </div>
                                        <div className="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-2xl">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Confirm Change
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function CardListView() {
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [sortBy, setSortBy] = useState("conflicts");
    const [globalFilterCompany, setGlobalFilterCompany] = useState("all");
    const [changeStaffPopup, setChangeStaffPopup] = useState({
        isOpen: false,
        conflictEvent: null,
        currentStaff: "",
    });

    // State to manage ALL filters for the *currently expanded card*
    const [expandedCardFilters, setExpandedCardFilters] = useState({
        lockedStaffs: new Set(),
        hoveredStaff: null,
        conflictingEventsSearchTerm: "",
        conflictingEventsTimeFilter: { start: "", end: "" },
        conflictingEventsSelectedCompanies: [],
    });

    // Memoize all unique companies for the global filter dropdown
    const allCompanies = useMemo(
        () => Array.from(new Set(mockEvents.map((e) => e.company))),
        []
    );

    const getConflictCount = (eventId) => {
        return mockConflicts.filter(
            (c) => c.event1 === eventId || c.event2 === eventId
        ).length;
    };

    const getConflictingStaff = (eventId) => {
        return [
            ...new Set(
                mockConflicts
                    .filter((c) => c.event1 === eventId || c.event2 === eventId)
                    .map((c) => c.person)
            ),
        ];
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
        const staffsToFilter =
            currentLockedStaffs.size > 0
                ? currentLockedStaffs
                : currentHoveredStaff
                    ? new Set([currentHoveredStaff])
                    : new Set();

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
            events = events.filter((event) =>
                event.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Filter by Time Range - ใช้ date-fns อย่างถูกต้อง
        if (timeFilter.start && timeFilter.end) {
            // แปลง string เป็น Date object (ใช้ปี 2000 เป็น dummy year)
            const filterStart = parse(
                timeFilter.start,
                "HH:mm",
                new Date(2000, 0, 1)
            );
            const filterEnd = parse(timeFilter.end, "HH:mm", new Date(2000, 0, 1));
            events = events.filter((e) => {
                const match = e.time.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
                if (!match) return true;
                const [, startStr, endStr] = match;
                const eventStart = parse(startStr, "HH:mm", new Date(2000, 0, 1));
                const eventEnd = parse(endStr, "HH:mm", new Date(2000, 0, 1));
                // เลือกโหมดที่ต้องการได้ที่นี่
                const hasOverlap = eventStart <= filterEnd && eventEnd >= filterStart;
                return hasOverlap;
            });
        }

        // 4. Filter by Selected Companies
        if (
            selectedCompanies.length > 0 &&
            selectedCompanies.length < allCompanies.length
        ) {
            events = events.filter((event) =>
                selectedCompanies.includes(event.company)
            );
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
            "Tech Corp": "from-blue-600 to-blue-700",
            "Global Solutions": "from-purple-600 to-purple-700",
            "Healthcare Plus": "from-pink-600 to-pink-700",
            "Retail Co": "from-amber-600 to-amber-700",
            "Finance Ltd": "from-emerald-600 to-emerald-700",
            "Innovate Inc": "from-cyan-600 to-cyan-700",
            "Innovate LLC": "from-orange-600 to-orange-700",
            "Media Inc": "from-teal-600 to-teal-700",
        };
        return colors[company] || "from-slate-600 to-slate-700";
    };

    const getCompanyBadgeColor = (company) => {
        const colors = {
            "Tech Corp": "bg-blue-800 text-blue-200 border-blue-700",
            "Global Solutions": "bg-purple-800 text-purple-200 border-purple-700",
            "Healthcare Plus": "bg-pink-800 text-pink-200 border-pink-700",
            "Retail Co": "bg-amber-800 text-amber-200 border-amber-700",
            "Finance Ltd": "bg-emerald-800 text-emerald-200 border-emerald-700",
            "Innovate Inc": "bg-cyan-800 text-cyan-200 border-cyan-700",
            "Innovate LLC": "bg-orange-800 text-orange-200 border-orange-700",
            "Media Inc": "bg-teal-800 text-teal-200 border-teal-700",
        };
        return colors[company] || "bg-slate-700 text-slate-300 border-slate-600";
    };

    const getSortedEvents = useMemo(() => {
        let events = [...mockEvents];
        if (globalFilterCompany !== "all") {
            events = events.filter((e) => e.company === globalFilterCompany);
        }
        if (sortBy === "conflicts") {
            return events.sort(
                (a, b) => getConflictCount(b.id) - getConflictCount(a.id)
            );
        } else if (sortBy === "time") {
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
                conflictingEventsSearchTerm: "",
                conflictingEventsTimeFilter: { start: "", end: "" },
                conflictingEventsSelectedCompanies: [],
            });
        } else {
            setExpandedCardId(id);
            // Also reset filters when a new card is expanded
            setExpandedCardFilters({
                lockedStaffs: new Set(),
                hoveredStaff: null,
                conflictingEventsSearchTerm: "",
                conflictingEventsTimeFilter: { start: "", end: "" },
                conflictingEventsSelectedCompanies: [],
            });
        }
    };

    // Handlers for conflicting events filters *within the expanded card*
    const setConflictingEventsSearchTerm = (term) => {
        setExpandedCardFilters((prev) => ({
            ...prev,
            conflictingEventsSearchTerm: term,
        }));
    };

    const setConflictingEventsTimeFilter = (type, value) => {
        setExpandedCardFilters((prev) => ({
            ...prev,
            conflictingEventsTimeFilter: {
                ...prev.conflictingEventsTimeFilter,
                [type]: value,
            },
        }));
    };

    const setConflictingEventsSelectedCompanies = (companies) => {
        setExpandedCardFilters((prev) => ({
            ...prev,
            conflictingEventsSelectedCompanies: companies,
        }));
    };

    const handleClearAllInternalFilters = () => {
        setExpandedCardFilters({
            lockedStaffs: new Set(),
            hoveredStaff: null,
            conflictingEventsSearchTerm: "",
            conflictingEventsTimeFilter: { start: "", end: "" },
            conflictingEventsSelectedCompanies: [],
        });
    };

    // Function to get staff conflicts details
    const getStaffConflictsDetails = (eventId, staffName) => {
        const staffConflicts = mockConflicts.filter(
            (c) =>
                c.person === staffName && (c.event1 === eventId || c.event2 === eventId)
        );

        const conflictEvents = staffConflicts
            .map((c) => {
                const conflictEventId = c.event1 === eventId ? c.event2 : c.event1;
                return mockEvents.find((e) => e.id === conflictEventId);
            })
            .filter(Boolean);

        return conflictEvents;
    };

    // Handler for opening change staff popup
    const handleOpenChangeStaff = (conflictEvent, currentStaff) => {
        setChangeStaffPopup({
            isOpen: true,
            conflictEvent,
            currentStaff,
        });
    };

    // Handler for closing change staff popup
    const handleCloseChangeStaff = () => {
        setChangeStaffPopup({
            isOpen: false,
            conflictEvent: null,
            currentStaff: "",
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
            />

            {/* View Header */}
            <div className="mb-8 border-b border-gray-700 pb-6">
                <h2 className="text-3xl font-bold mb-3 text-white">Events Card View</h2>
                <p className="text-gray-400 text-base">
                    Explore events and their conflicts. Click on a card to view detailed
                    staff assignments and conflicting events.
                </p>
            </div>

            {/* Global Filter and Sort Controls */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-inner mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-300 font-semibold text-sm mr-1">
                            Sort by:
                        </span>
                        <button
                            onClick={() => setSortBy("conflicts")}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === "conflicts"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                                }`}
                        >
                            Conflicts
                        </button>
                        <button
                            onClick={() => setSortBy("time")}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === "time"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                                }`}
                        >
                            Time
                        </button>
                        <button
                            onClick={() => setSortBy("name")}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${sortBy === "name"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
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
                            conflictingEventsSearchTerm !== "" ||
                            conflictingEventsTimeFilter.start !== "" ||
                            conflictingEventsTimeFilter.end !== "" ||
                            conflictingEventsSelectedCompanies.length > 0;

                        return (
                            <div
                                key={event.id}
                                className={`rounded-xl border transition-all duration-300 ${isExpanded
                                        ? `border-blue-500 shadow-xl shadow-blue-900/20`
                                        : "border-gray-700 hover:border-gray-600"
                                    } overflow-hidden`}
                            >
                                {/* Card Header - Always Visible */}
                                <div
                                    className={`w-full transition-all duration-300 ${isExpanded
                                            ? `bg-gradient-to-r ${getCompanyColor(event.company)}`
                                            : "bg-gray-850 hover:bg-gray-800"
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
                                                <h3
                                                    className={`font-extrabold text-xl ${isExpanded ? "text-white" : "text-gray-50"
                                                        }`}
                                                >
                                                    {event.name}
                                                </h3>
                                                <div
                                                    className={`flex items-center gap-3 mt-1 ${isExpanded ? "text-blue-100" : "text-gray-400"
                                                        }`}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">{event.time}</span>
                                                    <Briefcase className="w-4 h-4 ml-2" />
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full border ${getCompanyBadgeColor(
                                                            event.company
                                                        )}`}
                                                    >
                                                        {event.company}
                                                    </span>
                                                    {/* {conflictCount === 0 && (
                            <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              No Conflicts
                            </span>
                          )} */}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Right Section - Status and Expand Button */}
                                        <div className="flex items-center gap-3 sm:ml-auto">
                                            {conflictCount > 0 ? (
                                                <span
                                                    className={`text-lg font-semibold ${isExpanded ? "text-white" : "text-red-400"
                                                        }`}
                                                >
                                                    {conflictCount} Conflict
                                                    {conflictCount !== 1 ? "s" : ""}
                                                </span>
                                            ) : (
                                                <span
                                                    className={`text-lg font-semibold ${isExpanded ? "text-white" : "text-green-400"
                                                        }`}
                                                >
                                                    Complete
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "rotate-180 text-white" : "text-gray-400"
                                                    }`}
                                            />
                                        </div>
                                    </button>

                                    {/* Preview Section - Only show when NOT expanded */}
                                    {!isExpanded && (
                                        <div>
                                            {conflictCount > 0 ? (
                                                <div className="px-6 pb-4 border-t border-gray-700 pt-3 bg-gray-850">
                                                    <div>
                                                        <div className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Conflicts Issues
                                                        </div>
                                                        <ul className="space-y-1 text-sm">
                                                            {uniqueConflictingStaff
                                                                .slice(0, 3)
                                                                .map((staff) => {
                                                                    const staffConflicts = mockConflicts.filter(
                                                                        (c) =>
                                                                            c.person === staff &&
                                                                            (c.event1 === event.id ||
                                                                                c.event2 === event.id)
                                                                    );
                                                                    const conflictEventIds = staffConflicts.map(
                                                                        (c) =>
                                                                            c.event1 === event.id
                                                                                ? c.event2
                                                                                : c.event1
                                                                    );
                                                                    const conflictEventNames = conflictEventIds
                                                                        .map(
                                                                            (id) =>
                                                                                mockEvents.find((e) => e.id === id)
                                                                                    ?.name
                                                                        )
                                                                        .filter(Boolean);
                                                                    return (
                                                                        <li key={staff} className="text-red-300">
                                                                            •{" "}
                                                                            <span className="font-medium">
                                                                                {staff}
                                                                            </span>{" "}
                                                                            conflict{" "}
                                                                            <span className="text-red-400 font-semibold">
                                                                                ({conflictEventNames.length} event
                                                                                {conflictEventNames.length !== 1
                                                                                    ? "s"
                                                                                    : ""}
                                                                                )
                                                                            </span>{" "}
                                                                            with{" "}
                                                                            {conflictEventNames
                                                                                .slice(0, 2)
                                                                                .join(", ")}
                                                                            {conflictEventNames.length > 2 &&
                                                                                ` +${conflictEventNames.length - 2
                                                                                } more`}
                                                                        </li>
                                                                    );
                                                                })}
                                                            {uniqueConflictingStaff.length > 3 && (
                                                                <li className="text-red-300 italic">
                                                                    +{uniqueConflictingStaff.length - 3} more
                                                                    staff conflicts...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : (
                                                // No Conflict Preview - Show event summary
                                                // <div className="space-y-3">
                                                //   <div className="text-green-400 font-semibold text-sm flex items-center gap-2">
                                                //     <Check className="w-4 h-4" />
                                                //     Event Ready - All systems go!
                                                //   </div>
                                                //   <div className="grid grid-cols-2 gap-4 text-sm">
                                                //     <div className="space-y-2">
                                                //       <div className="flex items-center gap-2 text-gray-300">
                                                //         <Users className="w-4 h-4 text-blue-400" />
                                                //         <span>Staff: {event.staff.length} people</span>
                                                //       </div>
                                                //       <div className="flex items-center gap-2 text-gray-300">
                                                //         <MapPin className="w-4 h-4 text-green-400" />
                                                //         <span>Location: Ready</span>
                                                //       </div>
                                                //     </div>
                                                //     <div className="space-y-2">
                                                //       <div className="flex items-center gap-2 text-gray-300">
                                                //         <Briefcase className="w-4 h-4 text-purple-400" />
                                                //         <span>Equipment: Complete</span>
                                                //       </div>
                                                //       <div className="flex items-center gap-2 text-gray-300">
                                                //         <FileText className="w-4 h-4 text-yellow-400" />
                                                //         <span>Documents: Ready</span>
                                                //       </div>
                                                //     </div>
                                                //   </div>
                                                // </div>
                                                <div />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="bg-gray-900 border-t border-gray-700 p-6 space-y-6">
                                        {conflictCount > 0 ? (
                                            // Conflict View - แสดงตาม design เดิม
                                            <>
                                                {/* Action Required Section */}
                                                <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-xl p-5">
                                                    <h4 className="font-bold text-red-300 mb-4 text-xl flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                        Action Required ({
                                                            uniqueConflictingStaff.length
                                                        }{" "}
                                                        People)
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {uniqueConflictingStaff.map((staff) => {
                                                            const conflictEvents = getStaffConflictsDetails(
                                                                event.id,
                                                                staff
                                                            );
                                                            const staffPosition =
                                                                event.staff.find((s) => s.name === staff)
                                                                    ?.position || "Staff";

                                                            return (
                                                                <div
                                                                    key={staff}
                                                                    className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-red-800 border-opacity-50"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                                                                            {uniqueConflictingStaff.indexOf(staff) +
                                                                                1}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium bg-red-800 bg-opacity-50 text-red-200 px-2 py-1 rounded">
                                                                                    [{staffPosition}]
                                                                                </span>
                                                                                <span className="font-semibold text-red-200">
                                                                                    {staff}
                                                                                </span>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                {conflictEvents.map(
                                                                                    (conflictEvent, index) => (
                                                                                        <div
                                                                                            key={index}
                                                                                            className="flex items-center justify-between group"
                                                                                        >
                                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                                                                <span className="text-red-300">
                                                                                                    Conflict with
                                                                                                </span>
                                                                                                <span className="font-medium text-white">
                                                                                                    "{conflictEvent.name}"
                                                                                                </span>
                                                                                                <span className="text-gray-400 text-xs">
                                                                                                    {conflictEvent.time} •{" "}
                                                                                                    {conflictEvent.company}
                                                                                                </span>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleOpenChangeStaff(
                                                                                                        conflictEvent,
                                                                                                        staff
                                                                                                    )
                                                                                                }
                                                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 shadow-md"
                                                                                            >
                                                                                                เปลี่ยนคน
                                                                                            </button>
                                                                                        </div>
                                                                                    )
                                                                                )}
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
                                                        <Users className="w-5 h-5 text-blue-400" /> Staff
                                                        Assigned
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {Object.entries(staffByPosition).map(
                                                            ([position, names]) => (
                                                                <div
                                                                    key={position}
                                                                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner"
                                                                >
                                                                    <p className="text-sm font-semibold text-blue-300 uppercase mb-2">
                                                                        {position}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {names.map((name) => {
                                                                            const isConflicting =
                                                                                uniqueConflictingStaff.includes(name) &&
                                                                                conflictCount > 0;
                                                                            return (
                                                                                <span
                                                                                    key={name}
                                                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isConflicting
                                                                                            ? "bg-red-700 bg-opacity-40 text-red-100 border border-red-600"
                                                                                            : "bg-gray-700 text-gray-100 border border-gray-600"
                                                                                        }`}
                                                                                >
                                                                                    {name}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // No Conflict View - แสดงข้อมูล event แบบสมบูรณ์
                                            <>
                                                {/* Event Status Banner */}
                                                {/* <div className="bg-green-900 bg-opacity-20 border border-green-800 rounded-xl p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-green-300 text-xl">
                                  Event Ready
                                </h4>
                                <p className="text-green-200 text-sm">
                                  All systems operational - No conflicts
                                  detected
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-300 font-semibold">
                                Status: Ready
                              </div>
                              <div className="text-green-200 text-sm">
                                All staff confirmed
                              </div>
                            </div>
                          </div>
                        </div> */}

                                                {/* Basic Information */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <h4 className="font-bold text-gray-100 text-lg flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-blue-400" />{" "}
                                                            Basic Information
                                                        </h4>
                                                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-400">
                                                                        Event Name
                                                                    </label>
                                                                    <p className="text-white font-semibold">
                                                                        {event.name}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-400">
                                                                        Company
                                                                    </label>
                                                                    <p className="text-white">{event.company}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-400">
                                                                        Event Type
                                                                    </label>
                                                                    <p className="text-white">Offline Event</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="font-bold text-gray-100 text-lg flex items-center gap-2">
                                                            <Clock className="w-5 h-5 text-green-400" />{" "}
                                                            Schedule
                                                        </h4>
                                                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                            <div className="space-y-3">
                                                                <label className="text-sm font-medium text-gray-400">
                                                                    Date
                                                                    <p className="text-white">
                                                                        Wednesday, June 15
                                                                    </p>
                                                                </label>
                                                                <div className="grid mt-3">
                                                                    <div>
                                                                        <label className="text-sm font-medium text-gray-400">
                                                                            Start Time - End Time
                                                                        </label>
                                                                        <p className="text-white">
                                                                            {event.time.split(" - ")[0]} -{" "}
                                                                            {event.time.split(" - ")[1]}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-400">
                                                                        Location
                                                                    </label>
                                                                    <p className="text-white flex items-center gap-2">
                                                                        <MapPin className="w-4 h-4 text-green-400" />
                                                                        Main Conference Hall, Building A
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Equipment & Package */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <h4 className="font-bold text-gray-100 text-lg flex items-center gap-2">
                                                            <Briefcase className="w-5 h-5 text-yellow-400" />{" "}
                                                            Equipment Package
                                                        </h4>
                                                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-yellow-300 font-semibold">
                                                                    Premium Package
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2 text-sm">
                                                                {[
                                                                    "Wireless Microphones",
                                                                    "LED Projection",
                                                                    "Multinational Sound System",
                                                                    "LED Screen 2x20m",
                                                                ].map((item, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 text-gray-300"
                                                                    >
                                                                        <Check className="w-4 h-4 text-green-400" />
                                                                        {item}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="font-bold text-gray-100 text-lg flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-purple-400" />{" "}
                                                            Documents
                                                        </h4>
                                                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-300 text-sm">
                                                                        Event Plan.pdf
                                                                    </span>
                                                                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                                        Download
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-300 text-sm">
                                                                        Equipment List.xlsx
                                                                    </span>
                                                                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                                        Download
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-300 text-sm">
                                                                        Staff Schedule.pdf
                                                                    </span>
                                                                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                                        Download
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Staff Assigned - Complete View */}
                                                <div>
                                                    <h4 className="font-bold text-gray-100 mb-4 text-xl flex items-center gap-2">
                                                        <Users className="w-5 h-5 text-blue-400" /> Staff
                                                        Assigned
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {Object.entries(staffByPosition).map(
                                                            ([position, names]) => (
                                                                <div
                                                                    key={position}
                                                                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner"
                                                                >
                                                                    <div className="flex items-center mb-3">
                                                                        <p className="text-sm font-semibold text-blue-300 uppercase">
                                                                            {position}
                                                                        </p>
                                                                        <span className="text-xs bg-black text-white px-2 py-1 ml-2 rounded-full">
                                                                            {names.length}/{names.length}
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
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Staff Summary */}
                                                    {/* <div className="mt-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h5 className="font-semibold text-gray-100 mb-3">
                              Staff Summary
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-800">
                                <div className="text-blue-300 font-semibold">
                                  Internal Staff
                                </div>
                                <div className="text-white text-xl font-bold">
                                  {event.staff.length - 1}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-purple-900 bg-opacity-20 rounded-lg border border-purple-800">
                                <div className="text-purple-300 font-semibold">
                                  External Staff
                                </div>
                                <div className="text-white text-xl font-bold">
                                  1
                                </div>
                              </div>
                              <div className="text-center p-3 bg-green-900 bg-opacity-20 rounded-lg border border-green-800">
                                <div className="text-green-300 font-semibold">
                                  Total Staff
                                </div>
                                <div className="text-white text-xl font-bold">
                                  {event.staff.length}
                                </div>
                              </div>
                            </div>
                          </div> */}
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
                        <p className="text-base">
                            Please adjust your filters or sort options to see events.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}