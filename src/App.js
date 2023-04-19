import "./App.css";
import { Octokit } from "octokit";
import { Pagination, Input, Image, Radio, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { Collapse } from "antd";

const { Panel } = Collapse;
const { Search } = Input;

const octokit = new Octokit({
    auth: "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",
});

function App() {
    const [searchData, setSearchData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(null);
    const [search, setSearch] = useState("John");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);

    const checkHeaderLink = (headerLink) => {
        if (headerLink) {
            const linkHeader = headerLink;
            const lastPageLink = linkHeader.match(/<([^>]+)>;\s*rel="last"/)[1];
            let lastPageNumber = lastPageLink.split("=")[4];
            console.log(headerLink, "headerlink");
            setLastPage(lastPageNumber);
        } else {
            setLastPage(1);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        const users = await octokit.request(
            `GET /search/users?q=${search}&sort=repositories&order=${sortOrder}&page=${currentPage}`
        );
        setIsLoading(false);
        setSearchData(users.data);
        checkHeaderLink(users.headers.link);
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortOrder]);

    return (
        <div className="App">
            <Row justify="space-between" gutter={[16, 16]}>
                <Col>
                    <Search
                        placeholder="input search text"
                        onSearch={fetchUsers}
                        loading={isLoading}
                        enterButton
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: "360px" }}
                    />
                </Col>
                <Col>
                    <Radio.Group value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                        <Radio.Button value="desc">Сначала больше репозиториев</Radio.Button>
                        <Radio.Button value="asc">Сначала меньше репозиториев</Radio.Button>
                    </Radio.Group>
                </Col>
            </Row>

            {searchData?.total_count ? (
                <>
                    <Collapse defaultActiveKey={["1"]}>
                        {searchData?.items?.map((user) => (
                            <Panel
                                header={
                                    <div className="login-wrap">
                                        <Image width={25} src={user.avatar_url} />
                                        <h3>{user.login}</h3>
                                    </div>
                                }
                                key={user.id}
                            >
                                <div className="repo-and-id-wrap">
                                    <a href={user.html_url}>
                                        <p>{user.html_url}</p>
                                    </a>
                                    <p>id: {user.id}</p>
                                </div>
                            </Panel>
                        ))}
                    </Collapse>

                    <Pagination
                        defaultCurrent={1}
                        total={30 * lastPage}
                        pageSize={30}
                        showSizeChanger={false}
                        onChange={(currentPage) => setCurrentPage(currentPage)}
                        disabled={isLoading}
                    />
                </>
            ) : (
                <h4>Ничего не найдено, попробуйте изменить поисковый запрос</h4>
            )}
        </div>
    );
}

export default App;
