import React, { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Button, Layout, Card, Image } from "antd";

import SkeletonLoader from "./SkeletonLoader";
import { FaList, FaTh } from "react-icons/fa";
const { Content } = Layout;

const SportsLeagues = () => {
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("football");
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const searchBarRef = useRef(null);

  // Add function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const setSHow = (a) => {
    setSelectedCategory(a);
  };

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      let data;

      if (selectedCategory === "football") {
        // Fetch football data from default endpoint
        const response = await fetch(
          "https://bgs-backend.vercel.app/api/top100/sports"
        );
        data = await response.json();

        if (data.length > 0) {
          setLeagues(data);
          setFilteredLeagues(data);
        } else {
          setError("No football data available");
        }
      } else if (selectedCategory === "cricket") {
        // Fetch cricket data from cricket API
        const response = await fetch(
          "https://api.cricapi.com/v1/cricScore?apikey=0da59eab-0d6c-4950-b0ea-454786bb63e2"
        );
        const cricketData = await response.json();

        if (cricketData.data && cricketData.data.length > 0) {
          // Transform cricket data to match the structure expected by the component
          const formattedData = cricketData.data.map((match) => {
            // Determine match status color and label
            let statusColor = "text-orange-500";
            if (match.ms === "result") {
              statusColor = "text-green-500";
            } else if (match.ms === "fixture") {
              statusColor = "text-blue-500";
            }

            // Determine image based on match type
            let thumbnailImg = "./ODI.png";
            if (match.t1img) {
              thumbnailImg = match.t1img.replace("w=48", "w=512");
            } else if (match.t2img) {
              thumbnailImg = match.t2img.replace("w=48", "w=512");
            } else if (match.matchType === "t20") {
              thumbnailImg = "./T20.jpg";
            } else {
              thumbnailImg = "./ODI.png";
            }

            return {
              id: match.id,
              title: `${match.t1} vs ${match.t2}`,
              competition: match.matchType
                ? `${match.matchType.toUpperCase()} Cricket`
                : "Cricket Match",
              date: match.dateTimeGMT,
              thumbnail: thumbnailImg,
              matchviewUrl: "https://www.cricbuzz.com/",
              // Additional cricket-specific data
              status: match.status,
              matchState: match.ms,
              team1: match.t1,
              team2: match.t2,
              team1Score: match.t1s,
              team2Score: match.t2s,
              t1img: match.t1img ? match.t1img.replace("w=48", "w=512") : null,
              t2img: match.t2img ? match.t2img.replace("w=48", "w=512") : null,
              series: match.series,
              statusColor: statusColor,
              matchEnded: match.ms === "result",
            };
          });

          setLeagues(formattedData);
          setFilteredLeagues(formattedData);
        } else {
          setError("No cricket matches available");
        }
      } else if (selectedCategory === "basketball") {
        const currentDate = getCurrentDate();
        const response = await fetch(
          `https://v1.basketball.api-sports.io/games?date=${currentDate}`,
          {
            headers: {
              "x-apisports-key": "47f4d4ae2ec97f80df18a074084c523b",
            },
          }
        );
        const basketballData = await response.json();

        if (basketballData.response && basketballData.response.length > 0) {
          // Transform basketball data to match the structure expected by the component
          const formattedData = basketballData.response.map((game) => {
            // Determine status color
            let statusColor = "text-orange-500";
            if (game.status.short === "FT") {
              statusColor = "text-green-500";
            } else if (game.status.short === "NS") {
              statusColor = "text-blue-500";
            }

            return {
              id: game.id,
              title: `${game.teams.home.name} vs ${game.teams.away.name}`,
              competition: `${game.league.name} Basketball`,
              date: game.date,
              thumbnail: game.teams.home.logo || "./basketball-default.png",
              matchviewUrl: "https://www.sportingnews.com/in/nba",
              status: game.status.long,
              matchState: game.status.short,
              team1: game.teams.home.name,
              team2: game.teams.away.name,
              team1Score: game.scores.home
                ? `${game.scores.home.total} (Q1: ${game.scores.home.quarter_1}, Q2: ${game.scores.home.quarter_2}, Q3: ${game.scores.home.quarter_3}, Q4: ${game.scores.home.quarter_4})`
                : null,
              team2Score: game.scores.away
                ? `${game.scores.away.total} (Q1: ${game.scores.away.quarter_1}, Q2: ${game.scores.away.quarter_2}, Q3: ${game.scores.away.quarter_3}, Q4: ${game.scores.away.quarter_4})`
                : null,
              t1img: game.teams.home.logo,
              t2img: game.teams.away.logo,
              series: game.league.name,
              statusColor: statusColor,
              matchEnded: game.status.short === "FT",
            };
          });

          setLeagues(formattedData);
          setFilteredLeagues(formattedData);
        } else {
          setError("No basketball games available");
        }
      } else if (selectedCategory === "baseball") {
        const currentDate = getCurrentDate();
        const response = await fetch(
          `https://v1.baseball.api-sports.io/games?date=${currentDate}`,
          {
            headers: {
              "x-apisports-key": "47f4d4ae2ec97f80df18a074084c523b",
            },
          }
        );
        const baseballData = await response.json();

        if (baseballData.response && baseballData.response.length > 0) {
          // Transform baseball data to match the structure expected by the component
          const formattedData = baseballData.response.map((game) => {
            // Determine status color
            let statusColor = "text-orange-500";
            if (game.status.short === "FT") {
              statusColor = "text-green-500";
            } else if (game.status.short === "NS") {
              statusColor = "text-blue-500";
            }

            // Format innings scores for display
            const homeScore = game.scores.home;
            const awayScore = game.scores.away;

            // Create innings display string
            const formatInningsScore = (innings) => {
              if (!innings) return "";
              return Object.entries(innings)
                .filter(([key]) => key !== "extra" && innings[key] !== null)
                .map(([inning, score]) => `Inning ${inning}: ${score}`)
                .join(", ");
            };

            const homeInningsScore = formatInningsScore(homeScore.innings);
            const awayInningsScore = formatInningsScore(awayScore.innings);

            return {
              id: game.id,
              title: `${game.teams.home.name} vs ${game.teams.away.name}`,
              competition: `${game.league.name}`,
              date: game.date,
              thumbnail: game.teams.home.logo || "./baseball-default.png",
              matchviewUrl: "https://www.mlb.com/",
              status: game.status.long,
              matchState: game.status.short,
              team1: game.teams.home.name,
              team2: game.teams.away.name,
              team1Score: `${homeScore.total} (Hits: ${homeScore.hits}, Errors: ${homeScore.errors})\n${homeInningsScore}`,
              team2Score: `${awayScore.total} (Hits: ${awayScore.hits}, Errors: ${awayScore.errors})\n${awayInningsScore}`,
              t1img: game.teams.home.logo,
              t2img: game.teams.away.logo,
              series: game.league.name,
              statusColor: statusColor,
              matchEnded: game.status.short === "FT",
              venue: game.league.name,
              hits: {
                home: homeScore.hits,
                away: awayScore.hits,
              },
              errors: {
                home: homeScore.errors,
                away: awayScore.errors,
              },
            };
          });

          setLeagues(formattedData);
          setFilteredLeagues(formattedData);
        } else {
          setError("No baseball games available");
        }
      } else if (selectedCategory === "hockey") {
        const currentDate = getCurrentDate();
        const response = await fetch(
          `https://v1.hockey.api-sports.io/games?date=${currentDate}`,
          {
            headers: {
              "x-apisports-key": "47f4d4ae2ec97f80df18a074084c523b",
            },
          }
        );
        const hockeyData = await response.json();

        if (hockeyData.response && hockeyData.response.length > 0) {
          // Transform hockey data to match the structure expected by the component
          const formattedData = hockeyData.response.map((game) => {
            // Determine status color
            let statusColor = "text-orange-500";
            if (game.status.short === "FT") {
              statusColor = "text-green-500";
            } else if (game.status.short === "NS") {
              statusColor = "text-blue-500";
            }

            // Format periods scores for display
            const formatPeriodScores = (periods) => {
              if (!periods) return "";
              const scores = [];
              if (periods.first) scores.push(`1st: ${periods.first}`);
              if (periods.second) scores.push(`2nd: ${periods.second}`);
              if (periods.third) scores.push(`3rd: ${periods.third}`);
              if (periods.overtime) scores.push(`OT: ${periods.overtime}`);
              if (periods.penalties)
                scores.push(`Penalties: ${periods.penalties}`);
              return scores.join(", ");
            };

            const periodScores = formatPeriodScores(game.periods);

            return {
              id: game.id,
              title: `${game.teams.home.name} vs ${game.teams.away.name}`,
              competition: `${game.league.name}`,
              date: game.date,
              thumbnail: game.teams.home.logo || "./hockey-default.png",
              matchviewUrl: "https://www.nhl.com/",
              status: game.status.long,
              matchState: game.status.short,
              team1: game.teams.home.name,
              team2: game.teams.away.name,
              team1Score: `${game.scores.home} (${periodScores})`,
              team2Score: `${game.scores.away} (${periodScores})`,
              t1img: game.teams.home.logo,
              t2img: game.teams.away.logo,
              series: game.league.name,
              statusColor: statusColor,
              matchEnded: game.status.short === "FT",
              venue: game.league.name,
              periods: game.periods,
            };
          });

          setLeagues(formattedData);
          setFilteredLeagues(formattedData);
        } else {
          setError("No hockey games available");
        }
      } else if (selectedCategory === "volleyball") {
        const currentDate = getCurrentDate();
        const response = await fetch(
          `https://v1.volleyball.api-sports.io/games?date=${currentDate}`,
          {
            headers: {
              "x-apisports-key": "47f4d4ae2ec97f80df18a074084c523b",
            },
          }
        );
        const volleyballData = await response.json();

        if (volleyballData.response && volleyballData.response.length > 0) {
          // Transform volleyball data to match the structure expected by the component
          const formattedData = volleyballData.response.map((game) => {
            // Determine status color
            let statusColor = "text-orange-500";
            if (game.status.short === "FT") {
              statusColor = "text-green-500";
            } else if (game.status.short === "NS") {
              statusColor = "text-blue-500";
            }

            // Format set scores for display
            const formatSetScores = (periods) => {
              if (!periods) return "";
              const sets = [];
              if (periods.first)
                sets.push(`Set 1: ${periods.first.home}-${periods.first.away}`);
              if (periods.second)
                sets.push(
                  `Set 2: ${periods.second.home}-${periods.second.away}`
                );
              if (periods.third)
                sets.push(`Set 3: ${periods.third.home}-${periods.third.away}`);
              if (periods.fourth && periods.fourth.home !== null)
                sets.push(
                  `Set 4: ${periods.fourth.home}-${periods.fourth.away}`
                );
              if (periods.fifth && periods.fifth.home !== null)
                sets.push(`Set 5: ${periods.fifth.home}-${periods.fifth.away}`);
              return sets.join(", ");
            };

            const setScores = formatSetScores(game.periods);

            return {
              id: game.id,
              title: `${game.teams.home.name} vs ${game.teams.away.name}`,
              competition: `${game.league.name}`,
              date: game.date,
              thumbnail: game.teams.home.logo || "./volleyball-default.png",
              matchviewUrl: "#",
              status: game.status.long,
              matchState: game.status.short,
              team1: game.teams.home.name,
              team2: game.teams.away.name,
              team1Score: `${game.scores.home} (${setScores})`,
              team2Score: `${game.scores.away} (${setScores})`,
              t1img: game.teams.home.logo,
              t2img: game.teams.away.logo,
              series: game.league.name,
              statusColor: statusColor,
              matchEnded: game.status.short === "FT",
              venue: game.league.name,
              week: game.week,
              periods: game.periods,
            };
          });

          setLeagues(formattedData);
          setFilteredLeagues(formattedData);
        } else {
          setError("No volleyball games available");
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setError(`Failed to fetch ${selectedCategory} data, please try again.`);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const filterLeagues = useCallback(() => {
    if (!leagues.length) return;

    let filtered = [...leagues];
    if (searchQuery) {
      filtered = filtered.filter(
        (league) =>
          (league.competition &&
            league.competition
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (league.title &&
            league.title.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // Click outside to close search bar
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchBarOpen(false);
      }
    }
    if (isSearchBarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchBarOpen]);

  const menuItems = [
    { key: "football", label: "Football" },
    { key: "cricket", label: "Cricket" },
    { key: "basketball", label: "Basketball" },
    { key: "baseball", label: "Baseball" },
    { key: "hockey", label: "Hockey" },
    { key: "volleyball", label: "Volleyball" },
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen w-[90%] mx-auto bg-transparent">
        <Content className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex items-center" ref={searchBarRef} style={{ width: 300 }}>
                {!isSearchBarOpen ? (
                  <button
                    onClick={() => setIsSearchBarOpen((prev) => !prev)}
                    className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
                    title="Search"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                    </svg>
                    Search
                  </button>
                ) : (
                  <div className="relative w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" strokeWidth="2" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search competitions..."
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') {
                          setIsSearchBarOpen(false);
                          setSearchQuery("");
                        }
                      }}
                      autoFocus={isSearchBarOpen}
                    />
                  </div>
                )}
              </div>
              <div className="m-auto w-fit p-1 dark:text-white flex justify-center gap-4 rounded-md backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
                {menuItems.map((item, key) => (
                  <div
                    key={key}
                    className={` cursor-pointer px-3 py-2 rounded-md   ${
                      item.key === selectedCategory
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "hover:bg-gray-200/20 hover:dark:bg-[#513a7a]/20"
                    } `}
                    onClick={() => {
                      setSHow(item.key);
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              <div style={{ width: 300 }} className="flex justify-end">
                <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    title="Grid View"
                  >
                    <FaTh size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    title="List View"
                  >
                    <FaList size={15} />
                  </button>
                </div>
              </div>
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
            <div className="relative flex items-center" ref={searchBarRef} style={{ width: 300 }}>
              {!isSearchBarOpen ? (
                <button
                  onClick={() => setIsSearchBarOpen((prev) => !prev)}
                  className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
                  title="Search"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                  </svg>
                  Search
                </button>
              ) : (
                <div className="relative w-full px-2.5 py-2 rounded text-gray-700 dark:text-white focus:outline-none shadow-lg">
               
                  <input
                    type="text"
                   
                    className="w-full px-2.5 py-2 rounded  bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none shadow-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setIsSearchBarOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    autoFocus={isSearchBarOpen}
                  />
                </div>
              )}
            </div>
            <div className="m-auto w-fit p-1 dark:text-white flex justify-center gap-4 rounded-md backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
              {menuItems.map((item, key) => (
                <div
                  key={key}
                  className={` cursor-pointer px-3 py-2 rounded-md   ${
                    item.key === selectedCategory
                      ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                      : "hover:bg-gray-200/20 hover:dark:bg-[#513a7a]/20"
                  } `}
                  onClick={() => {
                    setSHow(item.key);
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div style={{ width: 300 }} className="flex justify-end">
              <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title="Grid View"
                >
                  <FaTh size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title="List View"
                >
                  <FaList size={15} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {filteredLeagues.length === 0 && !loading && !error ? (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No matches found for your search criteria.
              </p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredLeagues.map((league, index) => (
                <Col
                  xs={24}
                  sm={viewMode === "grid" ? 12 : 24}
                  lg={viewMode === "grid" ? 6 : 12}
                  xl={viewMode === "grid" ? 6 : 8}
                  key={league.id || `${league.title}-${index}`}
                >
                  {viewMode === "grid" ? (
                    <div className="p-4 rounded-lg backdrop-blur-lg dark:bg-[#28283A]/[var(--widget-opacity)] bg-white/[var(--widget-opacity)] dark:text-gray-300 ">
                      <div className="h-48 overflow-hidden">
                        <Image
                          alt={league.competition || "Sports match"}
                          src={league.thumbnail}
                          className="w-full rounded-lg h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          fallback={
                            selectedCategory === "cricket"
                              ? "./ODI.png"
                              : selectedCategory === "basketball"
                              ? "./NBA.jpg"
                              : selectedCategory === "baseball"
                              ? "./MLB.jpg"
                              : selectedCategory === "hockey"
                              ? "./NHL.jpg"
                              : selectedCategory === "volleyball"
                              ? "./volleyball-default.png"
                              : "./ODI.png"
                          }
                        />
                      </div>
                      <Card.Meta
                        title={
                          <div className="text-lg font-semibold px-4 py-2 dark:text-gray-100">
                            {league.competition || "Match"}
                          </div>
                        }
                        description={
                          <div className="dark:text-gray-400 px-4 py-2">
                            <p className="mb-2 font-medium">{league.title}</p>
                            {selectedCategory === "cricket" && (
                              <>
                                {league.status && (
                                  <p
                                    className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                  >
                                    {league.status}
                                  </p>
                                )}
                                {league.series && (
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">Series:</span>{" "}
                                    {league.series}
                                  </p>
                                )}
                                {(league.team1Score || league.team2Score) && (
                                  <div className="text-sm mb-1 text-green-600 dark:text-green-400">
                                    {league.team1Score && (
                                      <p>
                                        {league.team1}: {league.team1Score}
                                      </p>
                                    )}
                                    {league.team2Score && (
                                      <p>
                                        {league.team2}: {league.team2Score}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                            {selectedCategory === "basketball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}
                            {selectedCategory === "baseball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}
                            {selectedCategory === "hockey" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}
                            {selectedCategory === "volleyball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                                {league.week && (
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">Stage:</span>{" "}
                                    {league.week}
                                  </p>
                                )}
                              </>
                            )}
                            <p className="text-sm mt-2">
                              {league.date
                                ? new Date(league.date).toLocaleDateString()
                                : "Date not available"}
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
                          {selectedCategory === "football"
                            ? "Watch Highlights"
                            : selectedCategory === "cricket"
                            ? "View Match"
                            : selectedCategory === "basketball"
                            ? "View Details"
                            : selectedCategory === "baseball"
                            ? "View Details"
                            : selectedCategory === "hockey"
                            ? "View Details"
                            : selectedCategory === "volleyball"
                            ? "View Details"
                            : "View Details"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 p-4 rounded-lg backdrop-blur-lg dark:bg-[#28283A]/[var(--widget-opacity)] bg-white/[var(--widget-opacity)] dark:text-gray-300 transition-all duration-300 hover:shadow-xl dark:hover:shadow-purple-500/20">
                      <div
                        className={`w-40 h-28  flex items-center  ${
                          selectedCategory === "cricket"
                            ? "mt-7"
                            : selectedCategory === "basketball"
                            ? "mt-5"
                            : selectedCategory === "baseball"
                            ? "mt-5"
                            : selectedCategory === "hockey"
                            ? "mt-5"
                            : selectedCategory === "volleyball"
                            ? "mt-5"
                            : ""
                        }  `}
                      >
                        <Image
                          alt={league.competition || "Sports match"}
                          src={league.thumbnail}
                          className="w-full h-full rounded-lg object-fill"
                          fallback={
                            selectedCategory === "cricket"
                              ? "./ODI.png"
                              : selectedCategory === "basketball"
                              ? "./NBA.jpg"
                              : selectedCategory === "baseball"
                              ? "./MLB.jpg"
                              : selectedCategory === "hockey"
                              ? "./NHL.jpg"
                              : selectedCategory === "volleyball"
                              ? "./volleyball-default.png"
                              : "./ODI.png"
                          }
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-lg font-semibold dark:text-gray-100 mb-2 truncate">
                            {league.competition || "Match"}
                          </h3>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm dark:text-gray-400 truncate font-medium">
                              {league.title}
                            </span>

                            {selectedCategory === "cricket" && (
                              <>
                                {league.status && (
                                  <span
                                    className={`text-sm ${league.statusColor} font-medium`}
                                  >
                                    {league.status}
                                  </span>
                                )}
                                {league.series && (
                                  <span className="text-sm">
                                    <span className="font-medium">Series:</span>{" "}
                                    {league.series}
                                  </span>
                                )}
                                {(league.team1Score || league.team2Score) && (
                                  <div className="text-sm text-green-600 dark:text-green-400">
                                    {league.team1Score && (
                                      <span>
                                        {league.team1}: {league.team1Score}
                                      </span>
                                    )}
                                    {league.team2Score && (
                                      <span className="block">
                                        {league.team2}: {league.team2Score}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            )}

                            {selectedCategory === "basketball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}

                            {selectedCategory === "baseball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}

                            {selectedCategory === "hockey" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                              </>
                            )}

                            {selectedCategory === "volleyball" && (
                              <>
                                <p
                                  className={`text-sm mb-1 ${league.statusColor} font-medium`}
                                >
                                  {league.status}
                                </p>
                                {league.week && (
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">Stage:</span>{" "}
                                    {league.week}
                                  </p>
                                )}
                              </>
                            )}

                            <span className="text-sm dark:text-gray-400 mt-1">
                              {league.date
                                ? new Date(league.date).toLocaleDateString()
                                : "Date not available"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 dark:text-purple-300 whitespace-nowrap">
                              {selectedCategory === "football"
                                ? "Live Highlights"
                                : selectedCategory === "cricket"
                                ? league.matchEnded
                                  ? "Completed"
                                  : "Upcoming"
                                : selectedCategory === "basketball"
                                ? league.matchEnded
                                  ? "Completed"
                                  : "Upcoming"
                                : selectedCategory === "baseball"
                                ? league.matchEnded
                                  ? "Completed"
                                  : "Upcoming"
                                : selectedCategory === "hockey"
                                ? league.matchEnded
                                  ? "Completed"
                                  : "Upcoming"
                                : selectedCategory === "volleyball"
                                ? league.matchEnded
                                  ? "Completed"
                                  : "Upcoming"
                                : "Live Highlights"}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 dark:text-blue-300 whitespace-nowrap">
                              {league.competition
                                ? league.competition.split(" ")[0]
                                : selectedCategory}
                            </span>
                          </div>
                          <Button
                            type="primary"
                            href={league.matchviewUrl}
                            target="_blank"
                            size="small"
                            className="bg-indigo-500 dark:bg-[#513a7a] border-none hover:bg-indigo-600 dark:hover:bg-[#614a8a]"
                          >
                            {selectedCategory === "football"
                              ? "Watch Now"
                              : selectedCategory === "cricket"
                              ? "View Match"
                              : selectedCategory === "basketball"
                              ? "View Details"
                              : selectedCategory === "baseball"
                              ? "View Details"
                              : selectedCategory === "hockey"
                              ? "View Details"
                              : selectedCategory === "volleyball"
                              ? "View Details"
                              : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default SportsLeagues;
