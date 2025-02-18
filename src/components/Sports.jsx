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
  Modal,
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

const SportsLeagues = () => {
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leagueEvents, setLeagueEvents] = useState({});

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      // Using a more reliable free sports API
      const response = await fetch(
        `https://www.scorebat.com/video-api/v3/feed/?token=${
          import.meta.env.VITE_MATCH_KEY
        }`
      );
      const data = await response.json();
      if (data.response) {
        setLeagues(data.response);
        setFilteredLeagues(data.response);
      }
    } catch (error) {
      setError("Failed to fetch leagues, please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterLeagues = useCallback(() => {
    if (!leagues.length) return;

    let filtered = [...leagues];
    if (searchQuery) {
      filtered = filtered.filter(
        (league) =>
          league.competition
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          league.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredLeagues(filtered);
  }, [leagues, searchQuery]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  useEffect(() => {
    filterLeagues();
  }, [filterLeagues, searchQuery]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-transparent">
      <Content className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Search
              placeholder="Search competitions..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              className="dark:bg-[#28283A] dark:text-gray-300"
            />
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="dark:bg-[#28283A]"
            >
              <Radio.Button
                value="grid"
                className="dark:bg-[#513a7a] dark:text-gray-300"
              >
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button
                value="list"
                className="dark:bg-[#513a7a] dark:text-gray-300"
              >
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </div>

          <Row gutter={[16, 16]}>
            {filteredLeagues.map((league) => (
              <Col
                xs={24}
                sm={viewMode === "grid" ? 12 : 24}
                lg={viewMode === "grid" ? 6 : 24}
                key={league.title}
              >
                <Card
                  hoverable
                  className="dark:bg-[#28283A] dark:text-gray-300 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-purple-500/20"
                  cover={
                    <div className="h-48 overflow-hidden">
                      <img
                        alt={league.competition}
                        src={league.thumbnail}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div className="text-lg font-semibold dark:text-gray-100">
                        {league.competition}
                      </div>
                    }
                    description={
                      <div className="dark:text-gray-400">
                        <p className="mb-2">{league.title}</p>
                        <p className="text-sm">
                          {new Date(league.date).toLocaleDateString()}
                        </p>
                      </div>
                    }
                  />
                  <div className="mt-4">
                    <Button
                      type="primary"
                      href={league.matchviewUrl}
                      target="_blank"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-none"
                    >
                      Watch Highlights
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
