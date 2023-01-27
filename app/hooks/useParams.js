import dayjs from "dayjs";
import React, { useState } from "react";

const useParams = () => {
  const [state, setState] = useState({
    page: 1,
    limit: 25,
    search: "",
    searchBy: "_id",
    date: null,
  });

  const reset = () => {
    setState({
      page: 1,
      limit: 25,
      search: "",
      searchBy: "_id",
    });
  };

  return { reset, state, setState };
};

export default useParams;
