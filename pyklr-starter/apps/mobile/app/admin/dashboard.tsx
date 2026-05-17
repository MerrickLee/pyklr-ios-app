import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield, MapPin, AlertTriangle, CheckCircle, XCircle, Info, Calendar } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import { format } from 'date-fns';

type Tab = 'courts' | 'reports';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  
  const [activeTab, setActiveTab] = useState<Tab>('courts');

  // Fetch pending courts
  const { data: pendingCourts, isLoading: loadingCourts } = useQuery({
    queryKey: ['admin-pending-courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch active reports
  const { data: openReports, isLoading: loadingReports } = useQuery({
    queryKey: ['admin-open-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .in('status', ['open', 'reviewing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Update Court Status Mutation
  const updateCourtMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'verified' | 'flagged' }) => {
      const { error } = await supabase
        .from('courts')
        .update({ status, verified_by: (await supabase.auth.getUser()).data.user?.id || null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courts'] });
      Alert.alert('Success', 'Court status updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message);
    },
  });

  // Update Report Status Mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'actioned' | 'dismissed' }) => {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          resolved_by: (await supabase.auth.getUser()).data.user?.id || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-open-reports'] });
      Alert.alert('Success', 'Report status updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message);
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Shield size={20} color={primary} style={{ marginLeft: 8 }} />
        <Text style={{ flex: 1, marginLeft: 8, fontWeight: '700', fontSize: 16, color: c.text }}>
          Admin Dashboard
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', padding: 14, gap: 10 }}>
        <Pressable
          onPress={() => setActiveTab('courts')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'courts' ? primary : c.surface,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: activeTab === 'courts' ? 0.2 : 0,
            shadowRadius: 2,
            elevation: activeTab === 'courts' ? 2 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'courts' ? (scheme === 'dark' ? colors.brand.limeDark : '#FFF') : c.textMuted,
            }}
          >
            Pending Courts ({pendingCourts?.length ?? 0})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('reports')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'reports' ? primary : c.surface,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: activeTab === 'reports' ? 0.2 : 0,
            shadowRadius: 2,
            elevation: activeTab === 'reports' ? 2 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'reports' ? (scheme === 'dark' ? colors.brand.limeDark : '#FFF') : c.textMuted,
            }}
          >
            Active Reports ({openReports?.length ?? 0})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }}>
        {activeTab === 'courts' ? (
          loadingCourts ? (
            <ActivityIndicator size="large" color={primary} style={{ marginTop: 40 }} />
          ) : !pendingCourts || pendingCourts.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <CheckCircle size={44} color={c.textMuted} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>All caught up!</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>
                There are no pending courts waiting for verification.
              </Text>
            </View>
          ) : (
            pendingCourts.map((court) => (
              <Card key={court.id} style={{ padding: 14, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{court.name}</Text>
                    {court.address && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={13} color={c.textMuted} />
                        <Text style={{ fontSize: 12, color: c.textMuted }}>{court.address}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Court Meta Info */}
                <View style={{ flexDirection: 'row', gap: 14, backgroundColor: c.surface2, padding: 8, borderRadius: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>TYPE</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.text, marginTop: 2 }}>
                      {court.court_type}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>COURTS</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.text, marginTop: 2 }}>
                      {court.court_count}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>FEE</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.text, marginTop: 2 }}>
                      {court.fee_type}
                    </Text>
                  </View>
                </View>

                {/* Photos */}
                {court.photos && court.photos.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {court.photos.map((url, i) => (
                      <Image
                        key={i}
                        source={{ uri: url }}
                        style={{ width: 80, height: 60, borderRadius: 8, backgroundColor: c.surface2 }}
                      />
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        'Verify Court',
                        'Are you sure you want to verify this court?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Verify',
                            onPress: () => updateCourtMutation.mutate({ id: court.id, status: 'verified' }),
                          },
                        ]
                      )
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: scheme === 'dark' ? '#1b4332' : '#d8f3dc',
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <CheckCircle size={14} color={scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark,
                      }}
                    >
                      Verify
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        'Flag Court',
                        'Are you sure you want to flag this court as inappropriate or incorrect?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Flag',
                            style: 'destructive',
                            onPress: () => updateCourtMutation.mutate({ id: court.id, status: 'flagged' }),
                          },
                        ]
                      )
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: scheme === 'dark' ? '#4a1515' : '#ffe3e3',
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <XCircle size={14} color="#e63946" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#e63946' }}>
                      Flag
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )
        ) : (
          loadingReports ? (
            <ActivityIndicator size="large" color={primary} style={{ marginTop: 40 }} />
          ) : !openReports || openReports.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <CheckCircle size={44} color={c.textMuted} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>All quiet!</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>
                There are no active player or content reports.
              </Text>
            </View>
          ) : (
            openReports.map((report) => (
              <Card key={report.id} style={{ padding: 14, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#ffe3e3',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <AlertTriangle size={12} color="#e63946" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#e63946' }}>
                      {report.reason.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: c.textMuted }}>
                    {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                  </Text>
                </View>

                {/* Report Info */}
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>
                    TARGET: <Text style={{ fontWeight: '700', color: c.text }}>{report.target_type} ({report.target_id.slice(0, 8)})</Text>
                  </Text>
                  {report.description && (
                    <View style={{ backgroundColor: c.surface2, padding: 10, borderRadius: 8, marginTop: 4 }}>
                      <Text style={{ fontSize: 13, color: c.text, fontStyle: 'italic' }}>
                        "{report.description}"
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        'Take Action',
                        'Resolve this report by taking action (e.g., hiding content)?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Action',
                            onPress: () => updateReportMutation.mutate({ id: report.id, status: 'actioned' }),
                          },
                        ]
                      )
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: scheme === 'dark' ? '#1b4332' : '#d8f3dc',
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <CheckCircle size={14} color={scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark,
                      }}
                    >
                      Actioned
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        'Dismiss Report',
                        'Are you sure you want to dismiss this report without action?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Dismiss',
                            style: 'destructive',
                            onPress: () => updateReportMutation.mutate({ id: report.id, status: 'dismissed' }),
                          },
                        ]
                      )
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: scheme === 'dark' ? '#333' : '#eee',
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <XCircle size={14} color={c.textMuted} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: c.textMuted }}>
                      Dismiss
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
