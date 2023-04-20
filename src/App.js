import "./App.css";
import { octokit } from "./utils/octokit";
import { Pagination, Input, Image, Radio, Row, Col, message } from "antd";
import { useState, useEffect } from "react";
import { Collapse } from "antd";
import { pageSize } from "./utils/consts";

function App() {
    const [messageApi, contextMessageApi] = message.useMessage();
    const showMessage = (type, content) => {
        messageApi.open({
            type,
            content,
        });
    };

    const [searchData, setSearchData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(null);
    const [search, setSearch] = useState("John");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);

    const checkHeaderLink = (headerLink) => {
        if (headerLink) {
            const lastPageLink = headerLink.match(/<([^>]+)>;\s*rel="last"/)[1];
            let lastPageNumber = lastPageLink.split("=")[4];
            setLastPage(lastPageNumber);
        } else {
            setLastPage(1);
        }
    };

    const fetchUsers = async () => {
        if (!search) {
            showMessage("warning", "Поисковый запрос не может быть пустым");
            return;
        }

        try {
            setIsLoading(true);
            const users = await octokit.request(
                `GET /search/users?q=${search}&sort=repositories&order=${sortOrder}&page=${currentPage}`
            );
            setIsLoading(false);
            setSearchData(users.data);
            checkHeaderLink(users.headers.link);
        } catch (error) {
            if (error.message === "Cannot read properties of null (reading '1')") {
                return;
            }
            showMessage("error", "Неизвестная ошибка, попробуйте снова");
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortOrder]);

    return (
        <>
            {contextMessageApi}

            <div className="App">
                <Row justify="space-between" gutter={[16, 16]}>
                    <Col>
                        <Input.Search
                            placeholder="Поиск по пользователям"
                            onSearch={fetchUsers}
                            loading={isLoading}
                            enterButton
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            style={{ width: "360px" }}
                            data-testid="search"
                        />
                    </Col>
                    <Col>
                        <Radio.Group
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                            data-testid="sortRadio"
                        >
                            <Radio.Button value="desc">Сначала больше репозиториев</Radio.Button>
                            <Radio.Button value="asc">Сначала меньше репозиториев</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>

                {searchData?.total_count ? (
                    <>
                        <Collapse defaultActiveKey={["1"]}>
                            {searchData?.items?.map((user) => (
                                <Collapse.Panel
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
                                </Collapse.Panel>
                            ))}
                        </Collapse>

                        <Pagination
                            data-testid="pagination"
                            defaultCurrent={1}
                            total={pageSize * lastPage}
                            pageSize={pageSize}
                            showSizeChanger={false}
                            onChange={(currentPage) => setCurrentPage(currentPage)}
                            disabled={isLoading}
                        />
                    </>
                ) : (
                    <h4>Ничего не найдено, попробуйте изменить поисковый запрос</h4>
                )}
            </div>
        </>
    );
}

export default App;
