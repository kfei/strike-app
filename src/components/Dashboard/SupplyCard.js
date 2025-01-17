import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'antd';
import { Card } from 'components/Basic/Card';
import SupplySection from 'components/Basic/Supply/SupplySection';
import WithdrawSection from 'components/Basic/Supply/WithdrawSection';
import BorrowSection from 'components/Basic/Borrow/BorrowSection';
import RepaySection from 'components/Basic/Borrow/RepaySection';
import LoadingSpinner from 'components/Basic/LoadingSpinner';
import { compose } from 'recompose';
import { connectAccount } from 'core';
import { addToken } from 'utilities/common';
import metaMaskImg from 'assets/img/metamask.png';
import { getBigNumber } from 'utilities/common';

const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  background-color: var(--color-bg-primary);

  .loading-section {
    padding: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-token-wrapper {
    margin-top: 10px;
    margin-left: 20px;
    color: var(--color-text-main);

    @media only screen and (max-width: 1496px) {
      width: 100%;
      margin-left: 0px;
      justify-content: flex-end;
    }

    .add-token {
      font-size: 18px;
      color: var(--color-green);
      margin-left: 10px;
    }

    .underlying-asset,
    .stoken-asset {
      margin-right: 20px;
    }
    img {
      width: 20px;
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid #eef1fa;

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
    margin: 0 15px;
    font-size: 17px;
    font-weight: 600;
  }
  .tab-active {
    color: var(--color-white);
    background-color: var(--color-blue);
    box-shadow: 0px 4px 13px 0 rgba(39, 126, 230, 0.64);
  }
`;

function SupplyCard({ currentMarket, settings }) {
  const [currentTab, setCurrentTab] = useState('supply');
  const [currentAsset, setCurrentAsset] = useState({});

  useEffect(() => {
    if (currentMarket) {
      setCurrentTab(currentMarket);
    }
  }, [currentMarket]);

  useEffect(() => {
    const asset = settings.selectedAsset;
    if (asset) {
      setCurrentAsset({
        ...asset,
        supplyApy: getBigNumber(asset.supplyApy),
        borrowApy: getBigNumber(asset.borrowApy),
        walletBalance: getBigNumber(asset.walletBalance),
        supplyBalance: getBigNumber(asset.supplyBalance),
        sTokenBalance: getBigNumber(asset.sTokenBalance),
        borrowBalance: getBigNumber(asset.borrowBalance),
        collateralFactor: getBigNumber(asset.collateralFactor),
        tokenPrice: getBigNumber(asset.tokenPrice),
        liquidity: getBigNumber(asset.liquidity)
      })
    }
  }, [settings.selectedAsset]);

  return (
    <Card>
      <CardWrapper>
        {window.ethereum && window.ethereum.networkVersion && currentAsset.id && (
          <div className="flex align-center add-token-wrapper">
            {currentAsset.id !== 'eth' && (
              <div className="flex align-center underlying-asset">
                {currentAsset.id.toUpperCase()}
                <img
                  className="add-token pointer"
                  src={metaMaskImg}
                  onClick={() => addToken(currentAsset.id, settings.decimals[currentAsset.id].token, 'token')}
                />
              </div>
            )}
            <div className="flex align-center stoken-asset">
              {`s${currentAsset.id === 'wbtc' ? 'BTC' : currentAsset.id.toUpperCase()}`}
              <img
                className="add-token pointer"
                src={metaMaskImg}
                onClick={() => addToken(currentAsset.id, settings.decimals[currentAsset.id].stoken, 'stoken')}
              />
            </div>
          </div>
        )}
        {currentMarket === 'supply' ? (
          <>
            <Tabs>
              <div
                className={`tab-item center ${
                  currentTab === 'supply' ? 'tab-active' : ''
                }`}
                onClick={() => {
                  setCurrentTab('supply');
                }}
              >
                Supply
              </div>
              <div
                className={`tab-item center ${
                  currentTab === 'withdraw' ? 'tab-active' : ''
                }`}
                onClick={() => {
                  setCurrentTab('withdraw');
                }}
              >
                Withdraw
              </div>
            </Tabs>
            {!currentAsset ||
            Object.keys(currentAsset).length === 0 ? (
              <div className="loading-section">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {currentTab === 'supply' && (
                  <SupplySection asset={currentAsset} />
                )}
                {currentTab === 'withdraw' && (
                  <WithdrawSection asset={currentAsset} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Tabs>
              <div
                className={`tab-item center ${
                  currentTab === 'borrow' ? 'tab-active' : ''
                }`}
                onClick={() => {
                  setCurrentTab('borrow');
                }}
              >
                Borrow
              </div>
              <div
                className={`tab-item center ${
                  currentTab === 'repay' ? 'tab-active' : ''
                }`}
                onClick={() => {
                  setCurrentTab('repay');
                }}
              >
                Repay Borrow
              </div>
            </Tabs>
            {!currentAsset ||
            Object.keys(currentAsset).length === 0 ? (
              <div className="loading-section">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {currentTab === 'borrow' && (
                  <BorrowSection asset={currentAsset} />
                )}
                {currentTab === 'repay' && (
                  <RepaySection asset={currentAsset} />
                )}
              </>
            )}
          </>
        )}
      </CardWrapper>
    </Card>
  );
}

SupplyCard.propTypes = {
  currentMarket: PropTypes.string.isRequired,
  settings: PropTypes.object
};

SupplyCard.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

export default compose(connectAccount(mapStateToProps, null))(SupplyCard);
