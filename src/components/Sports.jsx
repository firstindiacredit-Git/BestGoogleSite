import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Spin,
  Button,
  Layout,
  Input,
  Radio,
  Card,
  Image,
} from "antd";
import SkeletonLoader from "./SkeletonLoader";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;

const SportsLeagues = () => {
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

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
      <Layout className="min-h-screen w-[90%] mx-auto bg-transparent">
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
          </div>
        </Content>
        <SkeletonLoader count={100} />
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen w-[90%] mx-auto bg-transparent">
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
                lg={viewMode === "grid" ? 6 : 12}
                xl={viewMode === "grid" ? 6 : 8}
                key={`${league.title}-${league.competition}-${league.date}`}
              >
                {viewMode === "grid" ? (
                  <div className="p-4 rounded-lg backdrop-blur-lg dark:bg-[#28283A]/[var(--widget-opacity)] bg-white/[var(--widget-opacity)] dark:text-gray-300 ">
                    <div className="h-48 overflow-hidden">
                      <Image
                        alt={league.competition}
                        src={league.thumbnail}
                        className="w-full rounded-lg h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Card.Meta
                      title={
                        <div className="text-lg font-semibold px-4 py-2 dark:text-gray-100">
                          {league.competition}
                        </div>
                      }
                      description={
                        <div className="dark:text-gray-400 px-4 py-2">
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
                        className="w-full bg-indigo-500 dark:bg-[#513a7a] border-none"
                      >
                        Watch Highlights
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 p-4 rounded-lg backdrop-blur-lg dark:bg-[#28283A]/[var(--widget-opacity)] bg-white/[var(--widget-opacity)] dark:text-gray-300 transition-all duration-300 hover:shadow-xl dark:hover:shadow-purple-500/20">
                    <div className="w-40 h-28 flex-shrink-0">
                      <Image
                        alt={league.competition}
                        src={league.thumbnail}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="text-lg font-semibold dark:text-gray-100 mb-2 truncate">
                          {league.competition}
                        </h3>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm dark:text-gray-400 truncate">
                            {league.title}
                          </span>
                          <span className="text-sm dark:text-gray-400">
                            {new Date(league.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 dark:text-purple-300 whitespace-nowrap">
                            Live Highlights
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 dark:text-blue-300 whitespace-nowrap">
                            {league.competition.split(" ")[0]}
                          </span>
                        </div>
                        <Button
                          type="primary"
                          href={league.matchviewUrl}
                          target="_blank"
                          size="small"
                          className="bg-indigo-500 dark:bg-[#513a7a] border-none hover:bg-indigo-600 dark:hover:bg-[#614a8a]"
                        >
                          Watch Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
