import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Spin,
  message,
  Button,
  Layout,
  Space,
  Divider,
  Input,
  Select,
  Radio,
  Alert,
} from "antd";
import {
  LoadingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TrophyOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const SportsLeagues = () => {
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [indianLeagues, setIndianLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/all_leagues.php"
      );
      const data = await response.json();
      setLeagues(data.leagues || []);
    } catch (error) {
      setError("Failed to fetch leagues, please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async (leagueId) => {
    try {
      setEventsLoading(true);
      setIsModalVisible(true);  // Show modal immediately
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`
      );
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      } else {
        message.info("No upcoming events found for this league");
      }
    } catch (error) {
      message.error("Failed to fetch events");
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchIndianSports = async () => {
    try {
      const response = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?s=Cricket&c=India"
      );
      const data = await response.json();
      setIndianLeagues(data.countries || []);
    } catch (error) {
      message.error("Failed to fetch Indian sports, please try again.");
    }
  };

  // Filter leagues based on search and sport selection
  const filterLeagues = useCallback(() => {
    let filtered = [...leagues];

    if (searchQuery) {
      filtered = filtered.filter((league) =>
        league.strLeague.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== "all") {
      filtered = filtered.filter((league) => league.strSport === selectedSport);
    }

    setFilteredLeagues(filtered);
  }, [leagues, searchQuery, selectedSport]);

  const handleViewUpcomingEvent = (leagueId) => {
    const league = indianLeagues.find((item) => item.idLeague === leagueId);
    setSelectedLeague(league); // Set the selected league for the modal
  };

  // Get unique sports for the filter dropdown
  const getSportsList = useCallback(() => {
    return [...new Set(leagues.map((league) => league.strSport))].sort();
  }, [leagues]);

  useEffect(() => {
    fetchLeagues();
    fetchIndianSports();
  }, [fetchLeagues]);

  useEffect(() => {
    filterLeagues();
  }, [filterLeagues]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Loading leagues..."
        />
      </div>
    );
  }

  return (
    <Layout className="p-8 border dark:bg-gray-900/50 rounded-lg bg-gray-200/50 dark:border-gray-800 border-gray-200">
      <Content style={{ padding: "2px", margin: "5px" }} className="dark:bg-gray-900/50">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="dark:bg-gray-900 dark:text-gray-300"
            >
              <Radio.Button value="grid" className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button value="list" className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>

            <Search
              placeholder="Search leagues..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", margin: "2rem" }}>
              <Spin size="large" className="dark:text-gray-300" />
            </div>
          ) : error ? (
            <Alert message={error} type="error" className="dark:bg-gray-800 dark:text-gray-300" />
          ) : (
            <Row gutter={[16, 16]} className="dark:bg-gray-900/50">
              {filteredLeagues.map((league) => (
                <Col
                  xs={24}
                  sm={viewMode === "grid" ? 12 : 24}
                  lg={viewMode === "grid" ? 6 : 24}
                  key={league.idLeague}
                >
                  <div className="relative group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-700/50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        {league.strLeague}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {league.strSport} - {league.strCountry}
                      </p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => fetchEvents(league.idLeague)}
                        className="w-full text-center py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        View Upcoming Event
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* Custom Modal */}
          {isModalVisible && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                  className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" 
                  onClick={() => setIsModalVisible(false)}
                ></div>

                {/* Modal panel */}
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-900 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-900 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                        Upcoming Events
                      </h3>
                      <button
                        onClick={() => setIsModalVisible(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                      {eventsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Spin size="large" className="dark:text-gray-300" />
                        </div>
                      ) : events.length > 0 ? (
                        events.map((event) => (
                          <div
                            key={event.idEvent}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                              {event.strEvent}
                            </h4>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <span className="mr-2">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </span>
                                {event.dateEvent}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <span className="mr-2">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                                {event.strTime}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No upcoming events found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Indian Leagues Section */}
          <Row gutter={[16, 16]}>
            {indianLeagues.map((league) => (
              <Col
                xs={24}
                sm={viewMode === "grid" ? 12 : 24}
                md={viewMode === "grid" ? 8 : 24}
                lg={viewMode === "grid" ? 6 : 24}
                key={league.idLeague}
              >
                <div className="relative group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-700/50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      {league.strLeague}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {league.strSport} - {league.strCountry}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => fetchEvents(league.idLeague)}
                      className="w-full text-center py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      View Upcoming Event
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* INDIAN.VIEW */}
          <Modal
            title={selectedLeague?.strEvent || "Upcoming Event"} // Use selectedLeague here
            open={!!selectedLeague} // Only open if there's a selected league
            onCancel={() => setSelectedLeague(null)} // Reset selectedLeague to close the modal
            footer={[
              <Button key="back" onClick={() => setSelectedLeague(null)}>
                Close
              </Button>,
            ]}
            width={800}
          >
            {selectedLeague && (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {selectedLeague.strBanner && (
                  <img
                    src={selectedLeague.strBanner}
                    alt="Event Thumbnail"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Space direction="vertical">
                      <strong>League:</strong> {selectedLeague.strLeague}
                      <strong>Sport:</strong> {selectedLeague.strSport}
                      <strong>Teams:</strong> {selectedLeague.strHomeTeam} vs{" "}
                      {selectedLeague.strAwayTeam}
                      <strong>Venue:</strong> {selectedLeague.strVenue}
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical">
                      <strong>Location:</strong> {selectedLeague.strCountry}
                      <strong>Date:</strong>{" "}
                      {new Date(selectedLeague.dateEvent).toLocaleString()}
                      <strong>Round:</strong> {selectedLeague.intRound}
                      <strong>Status:</strong> {selectedLeague.strStatus}
                      <strong>Discription:</strong>{" "}
                      {selectedLeague.strDescriptionEN}
                    </Space>
                  </Col>
                </Row>

                {selectedLeague.strHomeTeamBadge &&
                  selectedLeague.strAwayTeamBadge && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginTop: "16px",
                      }}
                    >
                      <img
                        src={selectedLeague.strLogo}
                        alt={`${selectedLeague.strLogo} Badge`}
                        style={{ width: "40px" }}
                      />
                      <img
                        src={selectedLeague.strAwayTeamBadge}
                        alt={`${selectedLeague.strAwayTeam} Badge`}
                        style={{ width: "40px" }}
                      />
                    </div>
                  )}
              </Space>
            )}
          </Modal>
        </Space>
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
