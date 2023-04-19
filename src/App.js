import "./App.css";
import { Octokit } from "octokit";
import { Pagination, Input, Image } from "antd";
import { useState, useEffect } from "react";
import { Collapse } from "antd";

const { Panel } = Collapse;
const { Search } = Input;

const octokit = new Octokit({
    auth: "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",
});

function App() {
    const [searchData, setSearchData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(null);
    const [search, setSearch] = useState("John");
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);

        const users = await octokit.request(`GET /search/users?q=${search}&page=${currentPage}`);

        setIsLoading(false);
        setSearchData(users.data);
        console.log(users.headers.link);

        if (users.headers.link) {
            const linkHeader = users.headers.link;
            const lastPageLink = linkHeader.match(/<([^>]+)>;\s*rel="last"/)[1];
            let lastPageNumber = lastPageLink.split("=")[2];
            if (lastPageNumber >= 34) {
                lastPageNumber = 33;
            }
            setLastPage(lastPageNumber);
        } else {
            setLastPage(1);
        }

        console.log(users.data);
    };

    const onSearch = (event) => {
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    return (
        <div className="App">
            <Search
                placeholder="input search text"
                onSearch={onSearch}
                loading={isLoading}
                enterButton
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

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
            />
        </div>
    );
}

export default App;
