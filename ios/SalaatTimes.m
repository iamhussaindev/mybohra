//
//  SalaatTimes.m
//  v2app
//
//  Created by Hussain Dehgamwala on 3/8/24.
//

#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(SalaatTimes, NSObject)

RCT_EXTERN_METHOD(getPrayerTimes:(NSInteger *)latitude
                  longitude:(NSInteger *)longitude
                  date:(NSString *)date
                  callback:(RCTResponseSenderBlock)callback)

@end
