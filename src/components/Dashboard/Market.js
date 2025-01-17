import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connectAccount, accountActionCreators } from 'core';
import SupplyMarket from 'components/Dashboard/Market/SupplyMarket';
import BorrowMarket from 'components/Dashboard/Market/BorrowMarket';
import { Card } from 'components/Basic/Card';
import { getBigNumber } from 'utilities/common';
import Toggle from 'components/Basic/Toggle';
import { Label } from 'components/Basic/Label';

const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  background-color: var(--color-bg-primary);
  padding: 15px 14px;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;

  .apy-toggle {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .toggel-label {
      margin: 5px 10px;
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  align-items: center;
  .tab-item {
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 48%;
    height: 41px;
    color: var(--color-text-main);
    background-color: var(--color-bg-main);
    margin: 1%;
    font-size: 17px;
    font-weight: 600;
  }
  .tab-active {
    color: var(--color-white);
    background-color: var(--color-blue);
    box-shadow: 0px 4px 13px 0 rgba(39, 126, 230, 0.64);
  }
`;

const TabContent = styled.div`
  width: 100%;
  height: calc(100% - 75px);
  margin-top: 10px;
  display: flex;
  justify-content: center;
`;

const Market = ({ currentMarket, setCurrentMarket, settings, setSetting }) => {
  const [suppliedAssets, setSuppliedAssets] = useState([]);
  const [nonSuppliedAssets, setNonSuppliedAssets] = useState([]);
  const [borrowedAssets, setBorrowedAssets] = useState([]);
  const [nonBorrowedAssets, setNonBorrowedAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [withSTRK, setWithSTRK] = useState(true);

  const updateMarketTable = async () => {
    const tempArr = [];
    settings.assetList.forEach(item => {
      const temp = {
        ...item,
        supplyApy: getBigNumber(item.supplyApy),
        borrowApy: getBigNumber(item.borrowApy),
        walletBalance: getBigNumber(item.walletBalance),
        supplyBalance: getBigNumber(item.supplyBalance),
        sTokenBalance: getBigNumber(item.sTokenBalance),
        borrowBalance: getBigNumber(item.borrowBalance),
        collateralFactor: getBigNumber(item.collateralFactor),
        tokenPrice: getBigNumber(item.tokenPrice),
        liquidity: getBigNumber(item.liquidity)
      };
      tempArr.push(temp);
    });

    const tempSuppliedData = [];
    const tempNonSuppliableData = [];
    const tempBorrowedData = [];
    const tempNonBorrowedData = [];
    tempArr.forEach(element => {
      if (element.supplyBalance.isZero()) {
        tempNonSuppliableData.push(element);
      } else {
        tempSuppliedData.push(element);
      }

      if (element.borrowBalance.isZero()) {
        tempNonBorrowedData.push(element);
      } else {
        tempBorrowedData.push(element);
      }
    });
    setSuppliedAssets([...tempSuppliedData]);
    setNonSuppliedAssets([...tempNonSuppliableData]);
    setBorrowedAssets([...tempBorrowedData]);
    setNonBorrowedAssets([...tempNonBorrowedData]);
  };

  useEffect(() => {
    if (settings.assetList && settings.assetList.length > 0) {
      updateMarketTable();
    }
  }, [settings.assetList]);

  useEffect(() => {
    if (
      settings.selectedAsset &&
      Object.keys(settings.selectedAsset).length > 0
    ) {
      return;
    }
    if (currentMarket === 'supply') {
      if (suppliedAssets.length > 0) {
        setSelectedAsset(suppliedAssets[0]);
      } else {
        setSelectedAsset(nonSuppliedAssets[0]);
      }
      return;
    }

    if (borrowedAssets.length > 0) {
      setSelectedAsset(borrowedAssets[0]);
    } else {
      setSelectedAsset(nonSuppliedAssets[0]);
    }
  }, [
    currentMarket,
    suppliedAssets,
    nonSuppliedAssets,
    borrowedAssets,
    nonBorrowedAssets,
    setSetting
  ]);

  useEffect(() => {
    if (selectedAsset && selectedAsset.id) {
      setSetting({ selectedAsset });
    }
  }, [selectedAsset]);

  useEffect(() => {
    setSetting({
      withSTRK
    });
  }, [withSTRK]);

  return (
    <Card>
      <CardWrapper>
        <TabContainer>
          <Tabs>
            <div
              className={`tab-item center ${
                currentMarket === 'supply' ? 'tab-active' : ''
              }`}
              onClick={() => {
                setCurrentMarket('supply');
              }}
            >
              Supply Market
            </div>
            <div
              className={`tab-item center ${
                currentMarket === 'borrow' ? 'tab-active' : ''
              }`}
              onClick={() => {
                setCurrentMarket('borrow');
              }}
            >
              Borrow Market
            </div>
          </Tabs>
          <div className="apy-toggle">
            <Label size="14" primary className="toggel-label">
              <div>Lending APY</div>
            </Label>
            <Toggle
              checked={withSTRK}
              onChecked={() => setWithSTRK(!withSTRK)}
            />
            <Label size="14" primary className="toggel-label">
              <div>Net APY</div>
            </Label>
          </div>
        </TabContainer>
        <TabContent>
          {currentMarket === 'supply' && (
            <SupplyMarket
              suppliedAssets={suppliedAssets}
              remainAssets={nonSuppliedAssets}
              setSelectedAsset={setSelectedAsset}
            />
          )}
          {currentMarket === 'borrow' && (
            <BorrowMarket
              borrowedAssets={borrowedAssets}
              remainAssets={nonBorrowedAssets}
              setSelectedAsset={setSelectedAsset}
            />
          )}
        </TabContent>
      </CardWrapper>
    </Card>
  );
};

Market.propTypes = {
  currentMarket: PropTypes.string.isRequired,
  setCurrentMarket: PropTypes.func.isRequired,
  settings: PropTypes.object,
  setSetting: PropTypes.func.isRequired
};

Market.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

const mapDispatchToProps = dispatch => {
  const { setSetting } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting
    },
    dispatch
  );
};

export default compose(connectAccount(mapStateToProps, mapDispatchToProps))(
  Market
);
