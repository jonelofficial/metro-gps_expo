import dayjs from "dayjs";
import React, { useState } from "react";

const useParams = () => {
  const [state, setState] = useState({
    page: 1,
    limit: 25,
    search: "",
    searchBy: "user_id._id",
    date: null,
  });

  const reset = () => {
    setState({
      page: 1,
      limit: 25,
      search: "",
      searchBy: "user_id._id",
      date: null,
    });
  };

  return { reset, state, setState };
};

export default useParams;
