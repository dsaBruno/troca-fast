import { idWorksApi } from './apis/idw';
import { vtexApi } from './apis/vtex';

export const getOrderInfos = async (
  order_id: string,
): Promise<{
  idw: any;
  vtex: any;
}> => {
  const order = await idWorksApi.get(`/orders?OrderFrom=${order_id}`);
  const orderIDW = await idWorksApi.get(`/orders/${order.data[0].IDOrder}`);
  const orderVtex = await vtexApi.get(`/oms/pvt/orders/${order_id}`);

  return {
    idw: orderIDW.data[0],
    vtex: orderVtex.data,
  };
};
