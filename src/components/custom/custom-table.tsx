import React from "react";

interface props {
  Support_Provided: string;
  Latest_Developments: string;
  Status: string;
  Asset_Name: string;
  Description: string;
  Website: string;
  Base_Currency: string;
  Deal_Support: string;
  Deal_Lead: string;
}

function CustomTable({
  Support_Provided,
  Latest_Developments,
  Status,
  Asset_Name,
  Description,
  Website,
  Base_Currency,
  Deal_Support,
  Deal_Lead,
}: props) {
  return (
    <tr>
      <td>{Support_Provided}</td>
      <td>{Latest_Developments}</td>
      <td>{Status}</td>
      <td>{Asset_Name}</td>
      <td>{Description}</td>
      <td>{Website}</td>
      <td>{Base_Currency}</td>
      <td>{Deal_Support}</td>
      <td>{Deal_Lead}</td>
    </tr>
  );
}

export default CustomTable;
