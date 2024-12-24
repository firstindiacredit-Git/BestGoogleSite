import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Button,
  Modal,
  Layout,
  Space,
  Divider,
  Input,
  Select,
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
const { Meta } = Card;
const { Search } = Input;
const { Option } = Select;

const SportsLeagues = () => {
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [indianLeagues, setIndianLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState(null);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/all_leagues.php"
      );
      const data = await response.json();
      setLeagues(data.leagues || []);
    } catch (error) {
      message.error("Failed to fetch leagues, please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async (leagueId) => {
    try {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`
      );
      const data = await response.json();
      if (data.events) {
        setSelectedEvent(data.events[0]);
      }
    } catch (error) {
      message.error("Failed to fetch event details, please try again.");
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
    <Layout>
      <Content style={{ padding: "2px", maxWidth: 1200, margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>
              <TrophyOutlined /> Sports Leagues
            </Title>
            <Button.Group>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </Button.Group>
          </div>

          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Search leagues..."
                allowClear
                enterButton={<SearchOutlined />}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter by sport"
                value={selectedSport}
                onChange={setSelectedSport}
              >
                <Option value="all">All Sports</Option>
                {getSportsList().map((sport) => (
                  <Option key={sport} value={sport}>
                    {sport}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={12}>
              <Typography.Text type="secondary">
                Showing {filteredLeagues.length} of {leagues.length} leagues
              </Typography.Text>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[10, 10]}>
            {filteredLeagues.map((league) => (
              <Col
                xs={24}
                sm={viewMode === "grid" ? 12 : 24}
                md={viewMode === "grid" ? 8 : 24}
                lg={viewMode === "grid" ? 6 : 24}
                key={league.idLeague}
              >
                <Card
                  hoverable
                  actions={[
                    <Button
                      type="link"
                      onClick={() => fetchEvents(league.idLeague)}
                    >
                      View Upcoming Event
                    </Button>,
                  ]}
                >
                  <Meta
                    title={league.strLeague}
                    description={`Sport: ${league.strSport}`}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {filteredLeagues.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Typography.Text type="secondary">
                No leagues found matching your criteria
              </Typography.Text>
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
                <Card
                  hoverable
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handleViewUpcomingEvent(league.idLeague)} // Updated to use handleViewUpcomingEvent
                    >
                      View Upcoming Event
                    </Button>,
                  ]}
                >
                  <Meta
                    title={league.strLeague}
                    description={`Sport: ${league.strSport}`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Space>

        {/* Event Modal */}
        <Modal
          title={selectedEvent?.strEvent}
          open={!!selectedEvent}
          onCancel={() => setSelectedEvent(null)}
          footer={[
            <Button key="back" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedEvent && (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {selectedEvent.strThumb && (
                <img
                  src={selectedEvent.strThumb}
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
                    <strong>League:</strong> {selectedEvent.strLeague}
                    <strong>Sport:</strong> {selectedEvent.strSport}
                    <strong>Teams:</strong> {selectedEvent.strHomeTeam} vs{" "}
                    {selectedEvent.strAwayTeam}
                    <strong>Venue:</strong> {selectedEvent.strVenue}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical">
                    <strong>Location:</strong> {selectedEvent.strCountry}
                    <strong>Date:</strong>{" "}
                    {new Date(selectedEvent.dateEvent).toLocaleString()}
                    <strong>Round:</strong> {selectedEvent.intRound}
                    <strong>Status:</strong> {selectedEvent.strStatus}
                  </Space>
                </Col>
              </Row>

              {selectedEvent.strHomeTeamBadge &&
                selectedEvent.strAwayTeamBadge && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "20px",
                      marginTop: "16px",
                    }}
                  >
                    <img
                      src={selectedEvent.strHomeTeamBadge}
                      alt={`${selectedEvent.strHomeTeam} Badge`}
                      style={{ width: "40px" }}
                    />
                    <img
                      src={selectedEvent.strAwayTeamBadge}
                      alt={`${selectedEvent.strAwayTeam} Badge`}
                      style={{ width: "40px" }}
                    />
                  </div>
                )}
            </Space>
          )}
        </Modal>
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
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
