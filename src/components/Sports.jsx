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
  Input,
  Select,
  Radio,
  Alert,
  Modal, // Added Modal import
  Card,
} from "antd";
import {
  LoadingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
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
  const [indianLeagues, setIndianLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [leagueEvents, setLeagueEvents] = useState({}); // Store events by league ID
  const [selectedEvent, setSelectedEvent] = useState(null); // Added selectedEvent state

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
      setIsModalVisible(true); // Show modal immediately
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`
      );
      const data = await response.json();
      if (data.events && data.events.length > 0) {
        setLeagueEvents((prev) => ({
          ...prev,
          [leagueId]: data.events[0], // Store only the first event for the league
        }));
        setSelectedEvent(data.events[0]); // Set the selected event
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
    <Layout className="w-[90vw] bg-transparent mx-auto  ">
      <Content className="rounded-sm">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Search
              placeholder="Search leagues..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              className="dark:bg-[#28283A] dark:text-gray-300 dark:border-gray-700"
            />
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="dark:bg-[#28283A] rounded-sm dark:text-gray-300"
            >
              <Radio.Button
                value="grid"
                className="dark:bg-[#513a7a] dark:text-gray-300 dark:border-gray-700"
              >
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button
                value="list"
                className="dark:bg-[#513a7a] dark:text-gray-300 dark:border-gray-700"
              >
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", margin: "2rem" }}>
              <Spin size="large" className="dark:text-gray-300" />
            </div>
          ) : error ? (
            <Alert
              message={error}
              type="error"
              className="dark:bg-[#513a7a] dark:text-gray-300"
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredLeagues.map((league) => (
                <Col
                  xs={24}
                  sm={viewMode === "grid" ? 12 : 24}
                  lg={viewMode === "grid" ? 6 : 24}
                  key={league.idLeague}
                >
                  <div className="relative group rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-700/50 bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-800">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        {league.strLeague}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {league.strSport} - {league.strCountry}
                      </p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-[#513a7a]/10 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => fetchEvents(league.idLeague)}
                        className="w-full text-center py-2 px-4 text-sm font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-700 dark:hover:text-blue-300 transition-colors duration-200"
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
          <Modal
            title="Upcoming Event"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              setSelectedLeague(null);
              setSelectedEvent(null); // Reset selected event when modal is closed
            }}
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedLeague(null);
                  setSelectedEvent(null); // Reset selected event when modal is closed
                }}
              >
                Close
              </Button>,
            ]}
            width={800}
          >
            {eventsLoading ? (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            ) : selectedEvent ? (
              <Card className="w-full">
                {selectedEvent.strThumb && (
                  <img
                    src={selectedEvent.strThumb}
                    alt="Event Thumbnail"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">
                  {selectedEvent.strEvent}
                </h3>
                <p className="text-gray-600">Date: {selectedEvent.dateEvent}</p>
                <p className="text-gray-600">Time: {selectedEvent.strTime}</p>
                {selectedEvent.strVenue && (
                  <p className="text-gray-600">
                    Venue: {selectedEvent.strVenue}
                  </p>
                )}
              </Card>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No upcoming events found for this league
              </div>
            )}
          </Modal>

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
                <div className="relative group rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-700/50 bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      {league.strLeague}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {league.strSport} - {league.strCountry}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-[#513a7a]/10 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => fetchEvents(league.idLeague)}
                      className="w-full text-center py-2 px-4 text-sm font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-700 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      View Upcoming Event
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Space>
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
