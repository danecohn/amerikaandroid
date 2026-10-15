import React from 'react';
import {act,fireEvent,render,screen,waitFor} from '@testing-library/react-native';
import Plus from '../src/Plus';
import Photo from '../src/Photo.android';
import {api} from '../src/api';
let mockCallbacks:any;
const mockFinish=jest.fn().mockResolvedValue(undefined),mockPurchase=jest.fn().mockResolvedValue(undefined),mockRestore=jest.fn();
jest.mock('expo-constants',()=>({__esModule:true,default:{executionEnvironment:'standalone'}}));
jest.mock('expo-iap',()=>({useIAP:(callbacks:any)=>{mockCallbacks=callbacks;return {connected:true,fetchProducts:jest.fn().mockResolvedValue(undefined),subscriptions:[{id:'amerika_plus',displayPrice:'$8.00',subscriptionOffers:[{basePlanIdAndroid:'monthly',offerTokenAndroid:'google-offer',displayPrice:'$8.00',period:{unit:'month',value:1}}]}],finishTransaction:mockFinish,requestPurchase:mockPurchase};},getAvailablePurchases:()=>mockRestore()}));
jest.mock('../src/api',()=>({ORIGIN:'https://www.amerika.social',api:{request:jest.fn()}}));
beforeEach(()=>{jest.clearAllMocks();(api.request as jest.Mock).mockImplementation(async(path:string)=>path==='billing/google'?{enabled:true,productId:'amerika_plus',basePlanId:'monthly',obfuscatedAccountId:'opaque-owner'}:{plus:true});});
test('Google checkout uses the server account binding and confirms on the server before finishing',async()=>{
 const updated=jest.fn().mockResolvedValue(undefined);await render(<Plus me={{plus:false} as any} onClose={()=>{}} onUpdated={updated}/>);await screen.findByText('Subscribe with Google Play');await fireEvent.press(screen.getByText('Subscribe with Google Play'));
 expect(mockPurchase).toHaveBeenCalledWith({type:'subs',request:{google:{skus:['amerika_plus'],obfuscatedAccountId:'opaque-owner',subscriptionOffers:[{sku:'amerika_plus',offerToken:'google-offer'}]}}});
 await act(async()=>{mockCallbacks.onPurchaseSuccess({productId:'amerika_plus',purchaseState:'purchased',purchaseToken:'google-token'});});
 await waitFor(()=>expect(mockFinish).toHaveBeenCalled());expect(api.request).toHaveBeenCalledWith('billing/google/verify',{purchaseToken:'google-token'});expect(updated).toHaveBeenCalled();
});
test('pending payment and rejected ownership cannot finish or grant client-side Plus',async()=>{
 await render(<Plus me={{plus:false} as any} onClose={()=>{}} onUpdated={async()=>{}}/>);await screen.findByText('Subscribe with Google Play');await act(async()=>{mockCallbacks.onPurchaseSuccess({productId:'amerika_plus',purchaseState:'pending',purchaseToken:'pending-token'});});expect(mockFinish).not.toHaveBeenCalled();expect(api.request).not.toHaveBeenCalledWith('billing/google/verify',expect.anything());
 (api.request as jest.Mock).mockRejectedValueOnce(Error('This purchase belongs to another account.'));await act(async()=>{mockCallbacks.onPurchaseSuccess({productId:'amerika_plus',purchaseState:'purchased',purchaseToken:'other-token'});});await screen.findByText('This purchase belongs to another account.');expect(mockFinish).not.toHaveBeenCalled();
});
test('restoring Google subscriptions verifies each receipt instead of trusting device history',async()=>{
 mockRestore.mockResolvedValue([{productId:'amerika_plus',purchaseState:'purchased',purchaseToken:'restored-token'}]);await render(<Plus me={{plus:false} as any} onClose={()=>{}} onUpdated={async()=>{}}/>);await screen.findByText('Restore purchases');await fireEvent.press(screen.getByText('Restore purchases'));await waitFor(()=>expect(api.request).toHaveBeenCalledWith('billing/google/verify',{purchaseToken:'restored-token'}));
});
test('Android photo viewer supports accessible zoom controls and closing',async()=>{
 await render(<Photo uri="https://example.invalid/photo.png" alt="A test photo"/>);await fireEvent.press(screen.getByLabelText('Open photo: A test photo'));await screen.findByText('Zoom in');await fireEvent.press(screen.getByText('Zoom in'));await fireEvent.press(screen.getByText('Reset zoom'));await fireEvent.press(screen.getByText('Close photo'));expect(screen.queryByText('Zoom in')).toBeNull();
});
