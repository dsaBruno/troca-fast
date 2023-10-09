import { idWorksApi } from './apis/idw';

export const updateSkuReturnOrder = async (
  IDOrder: string,
  item: { refId: string; quantity: number },
) => {
  const orderReturnIDW = await idWorksApi.get(`/orders/${IDOrder}`);

  const {
    Comments,
    IDSku,
    IDStockKeepingUnitWarehouse,
    IDTypeFulfillmentNonconformity,
    NfeNItemPed,
    PercentDiscount,
    PriceList,
    PriceSelling,
    QuantityNonconformity,
    ValueDiscount,
    IDSkuMovement,
  } = orderReturnIDW.data[0].Items.find(
    (product) => product.IDSkuCompany === item.refId,
  );

  await idWorksApi.put(`/orders/${IDOrder}/sku/${IDSkuMovement}`, {
    Comments,
    IDSku,
    IDStockKeepingUnitWarehouse,
    IDTypeFulfillmentNonconformity,
    NfeNItemPed,
    PercentDiscount,
    PriceList,
    PriceSelling,
    Quantity: item.quantity,
    QuantityNonconformity,
    ValueDiscount,
  });

  return;
};
