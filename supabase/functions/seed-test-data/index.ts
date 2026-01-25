import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const testPassword = 'TestPass123!';
    const createdUsers: Record<string, string> = {};

    // Define test users
    const recipients = [
      {
        email: 'maya.test@example.com',
        full_name: 'Maya Johnson',
        location: 'Nairobi, Kenya',
        country: 'Kenya',
        avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
        profile: {
          creator_type: 'developer',
          xp: 450,
          rank: 'Silver',
          bio: 'Full-stack developer passionate about building solutions for African farmers. Currently learning React Native to create mobile apps that connect farmers directly to markets.',
          tagline: 'Building tech for African agriculture 🌱',
          portfolio_url: 'https://mayabuilds.dev',
          institution: 'University of Nairobi',
          is_verified: true,
        },
        dream: {
          device_needed: 'MacBook Pro',
          purpose: 'Building mobile apps for local farmers to track crop prices and connect directly with buyers, eliminating middlemen who take 40% of their earnings.',
          needs_refurbishing: false,
        }
      },
      {
        email: 'carlos.test@example.com',
        full_name: 'Carlos Rivera',
        location: 'Mexico City, Mexico',
        country: 'Mexico',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        profile: {
          creator_type: 'artist',
          xp: 200,
          rank: 'Bronze',
          bio: 'Digital artist creating murals that celebrate Mexican heritage and community stories. My art has been featured in 3 community centers.',
          tagline: 'Art that tells our stories 🎨',
          portfolio_url: null,
          institution: null,
          is_verified: true,
        },
        dream: {
          device_needed: 'iPad Pro with Apple Pencil',
          purpose: 'Creating digital murals for community centers that celebrate local heritage and teach children about Mexican art history through interactive installations.',
          needs_refurbishing: true,
        }
      },
      {
        email: 'aisha.test@example.com',
        full_name: 'Aisha Patel',
        location: 'Mumbai, India',
        country: 'India',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        profile: {
          creator_type: 'student',
          xp: 75,
          rank: 'Bronze',
          bio: null,
          tagline: 'CS student dreaming of Google 💻',
          portfolio_url: null,
          institution: 'IIT Mumbai',
          is_verified: true,
        },
        dream: {
          device_needed: 'Laptop',
          purpose: 'Completing my computer science degree online. My current laptop crashes constantly and I lose hours of work. Need something reliable for coding assignments.',
          needs_refurbishing: true,
        }
      },
      {
        email: 'james.test@example.com',
        full_name: 'James Okonkwo',
        location: 'Lagos, Nigeria',
        country: 'Nigeria',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        profile: {
          creator_type: 'entrepreneur',
          xp: 25,
          rank: 'Bronze',
          bio: null,
          tagline: null,
          portfolio_url: null,
          institution: null,
          is_verified: false,
        },
        dream: {
          device_needed: 'Smartphone',
          purpose: 'Managing inventory and customer orders for my small electronics repair business. Currently using a broken phone that barely makes calls.',
          needs_refurbishing: true,
        }
      },
      {
        email: 'sarah.test@example.com',
        full_name: 'Sarah Chen',
        location: null,
        country: null,
        avatar_url: null,
        profile: {
          creator_type: null,
          xp: 0,
          rank: 'Bronze',
          bio: null,
          tagline: null,
          portfolio_url: null,
          institution: null,
          is_verified: false,
        },
        dream: {
          device_needed: 'Tablet',
          purpose: 'Learning graphic design to start a freelance career. I want to create logos and branding for small businesses in my community.',
          needs_refurbishing: true,
        }
      }
    ];

    const donor = {
      email: 'david.donor@example.com',
      full_name: 'David Thompson',
      location: 'San Francisco, USA',
      country: 'United States',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      profile: {
        donor_type: 'individual',
        organization_name: null,
        total_donated: 0,
        recipients_helped: 0,
        regions_reached: 0,
      }
    };

    // Create recipient accounts
    for (const recipient of recipients) {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', recipient.email)
        .single();

      if (existingUsers) {
        console.log(`User ${recipient.email} already exists, skipping...`);
        createdUsers[recipient.email] = existingUsers.id;
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: recipient.email,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: recipient.full_name }
      });

      if (authError) {
        console.error(`Error creating user ${recipient.email}:`, authError);
        continue;
      }

      const userId = authData.user.id;
      createdUsers[recipient.email] = userId;

      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: recipient.full_name,
          location: recipient.location,
          country: recipient.country,
          avatar_url: recipient.avatar_url,
        })
        .eq('id', userId);

      // Insert user role
      await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'recipient' });

      // Insert recipient profile
      await supabase
        .from('recipient_profiles')
        .insert({
          user_id: userId,
          creator_type: recipient.profile.creator_type,
          xp: recipient.profile.xp,
          rank: recipient.profile.rank,
          bio: recipient.profile.bio,
          tagline: recipient.profile.tagline,
          portfolio_url: recipient.profile.portfolio_url,
          institution: recipient.profile.institution,
          is_verified: recipient.profile.is_verified,
        });

      // Insert dream request
      await supabase
        .from('dream_requests')
        .insert({
          recipient_id: userId,
          device_needed: recipient.dream.device_needed,
          purpose: recipient.dream.purpose,
          needs_refurbishing: recipient.dream.needs_refurbishing,
          status: 'open',
        });

      console.log(`Created recipient: ${recipient.email}`);
    }

    // Create donor account
    const { data: existingDonor } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', donor.email)
      .single();

    let donorUserId: string;

    if (existingDonor) {
      console.log(`Donor ${donor.email} already exists`);
      donorUserId = existingDonor.id;
    } else {
      const { data: donorAuthData, error: donorAuthError } = await supabase.auth.admin.createUser({
        email: donor.email,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: donor.full_name }
      });

      if (donorAuthError) {
        throw new Error(`Error creating donor: ${donorAuthError.message}`);
      }

      donorUserId = donorAuthData.user.id;

      // Update donor profile
      await supabase
        .from('profiles')
        .update({
          full_name: donor.full_name,
          location: donor.location,
          country: donor.country,
          avatar_url: donor.avatar_url,
        })
        .eq('id', donorUserId);

      // Insert donor role
      await supabase
        .from('user_roles')
        .insert({ user_id: donorUserId, role: 'donor' });

      // Insert donor profile
      await supabase
        .from('donor_profiles')
        .insert({
          user_id: donorUserId,
          donor_type: donor.profile.donor_type,
          organization_name: donor.profile.organization_name,
          total_donated: donor.profile.total_donated,
          recipients_helped: donor.profile.recipients_helped,
          regions_reached: donor.profile.regions_reached,
        });

      console.log(`Created donor: ${donor.email}`);
    }

    // Create a donation from David to Maya
    const mayaUserId = createdUsers['maya.test@example.com'];
    
    if (mayaUserId) {
      // Get Maya's dream request
      const { data: mayaDream } = await supabase
        .from('dream_requests')
        .select('id')
        .eq('recipient_id', mayaUserId)
        .single();

      if (mayaDream) {
        // Check if donation already exists
        const { data: existingDonation } = await supabase
          .from('donations')
          .select('id')
          .eq('donor_id', donorUserId)
          .eq('linked_dream_request_id', mayaDream.id)
          .single();

        if (!existingDonation) {
          // Create donation with mock media
          const { data: donation, error: donationError } = await supabase
            .from('donations')
            .insert({
              donor_id: donorUserId,
              device_type: 'Laptop',
              device_specs: 'MacBook Air M1, 8GB RAM, 256GB SSD, Space Gray, 2021',
              condition: 'used',
              needs_refurbishing: false,
              status: 'matchable',
              linked_dream_request_id: mayaDream.id,
              media_front_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
              media_back_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
              media_screen_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
              media_serial_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
              verified_at: new Date().toISOString(),
              verification_notes: 'Device verified - excellent condition, all photos clear',
            })
            .select()
            .single();

          if (donationError) {
            console.error('Error creating donation:', donationError);
          } else {
            console.log('Created donation:', donation.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test data seeded successfully',
        credentials: {
          recipients: recipients.map(r => ({ email: r.email, password: testPassword })),
          donor: { email: donor.email, password: testPassword }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error seeding test data:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
